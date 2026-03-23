const Chat = require('../models/Chat');

exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveChatMessage = async (req, res) => {
  try {
    const { role, text, chips } = req.body;
    
    const message = await Chat.create({
      user: req.user._id,
      role,
      text,
      chips
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    await Chat.deleteMany({ user: req.user._id });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.askAssistant = async (req, res) => {
  try {
    const { message, chips } = req.body;
    const userRole = req.user.role;
    
    // Save user message
    const userMessage = await Chat.create({
      user: req.user._id,
      role: 'user',
      text: message,
      chips
    });

    // Get chat history for context
    const history = await Chat.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(20);
    const messages = history.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text
    }));

    // System prompt
    messages.unshift({
      role: 'system',
      content: `You are the CampusAI Assistant for Campus Connect university app. The user chatting with you is a ${userRole}. Provide helpful, concise answers. If asked about schedules, grades, attendance, or alerts, provide realistic and helpful contextual data. Keep responses to a few short paragraphs.`
    });

    // Try Calling Groq API
    let replyText = '';
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!groqRes.ok) {
        throw new Error('Groq access issue');
      }

      const groqData = await groqRes.json();
      replyText = groqData.choices[0].message.content;
    } catch (apiError) {
      console.warn('Groq API failed, using fallback logic:', apiError.message);
      // Fallback Logic
      const lower = message.toLowerCase();
      if (lower.includes('schedule') || lower.includes('time')) {
        replyText = "Your schedule is available in the 'Timetable' section. You have 3 classes today starting from 9:00 AM. I recommend checking the specific room numbers there.";
      } else if (lower.includes('attendance')) {
        replyText = "I see your overall attendance is around 82%. You're well above the 75% threshold, but don't miss any more 'Advanced Web' classes this week!";
      } else if (lower.includes('library')) {
        replyText = "The Central Library is open until 9:00 PM today. You can find the Digital Library section in the app sidebar for e-resources.";
      } else if (lower.includes('assignment') || lower.includes('due')) {
        replyText = "You have an upcoming assignment for 'Machine Learning' due this Friday. You can submit it directly through the 'Manage Assignments' portal.";
      } else {
        replyText = "Hello! I'm currently in institutional offline mode but I can still help. Try asking about your 'schedule', 'attendance', 'assignments', or 'library locations'. How can I assist you further?";
      }
    }

    // Save AI message
    const aiMessage = await Chat.create({
      user: req.user._id,
      role: 'ai',
      text: replyText
    });

    res.status(201).json({ userMessage, aiMessage });
  } catch (error) {
    console.error('Ask Assistant Error:', error);
    res.status(500).json({ message: error.message });
  }
};
