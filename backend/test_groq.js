const fetch = require('node-fetch');
require('dotenv').config();

async function testGroq() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 10
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testGroq();
