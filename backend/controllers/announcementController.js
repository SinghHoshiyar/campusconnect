const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all announcements
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('author', 'name role');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, badgeColor, icon } = req.body;
    
    // req.user is set by auth middleware
    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      author: req.user._id,
      badgeColor: badgeColor || 'blue',
      icon: icon || '📢'
    });

    // Notify all users
    const allUsers = await User.find({ _id: { $ne: req.user._id } });
    const io = req.app.get('io');
    
    for (const u of allUsers) {
      const notif = await Notification.create({
        recipient: u._id,
        sender: req.user._id,
        title: 'New Announcement',
        text: title,
        type: 'announcement_new',
        link: '/app/announcements'
      });
      io.to(u._id.toString()).emit('notification', notif);
      io.to(u._id.toString()).emit('refreshData');
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Only admin or the author can delete
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'name role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
