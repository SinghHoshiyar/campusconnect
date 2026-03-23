const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all resources
// @route   GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const { category, course } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    
    // Improved search: check both title and course fields
    if (course) {
      query.$or = [
        { title: new RegExp(course, 'i') },
        { course: new RegExp(course, 'i') }
      ];
    }

    const resources = await Resource.find(query).populate('uploadedBy', 'name role').sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a resource
// @route   POST /api/resources
exports.createResource = async (req, res) => {
  try {
    const { title, description, category, fileUrl, course } = req.body;

    const resource = await Resource.create({
      title,
      description,
      category,
      fileUrl,
      course,
      uploadedBy: req.user._id
    });

    // Persistent Global Notifications for students
    const students = await User.find({ role: 'student' });
    const notifications = students.map(s => ({
      user: s._id,
      title: 'New Resource Available',
      text: `${req.user.name} uploaded "${title}" to the Digital Library.`,
      link: '/app/library',
      type: 'info'
    }));
    await Notification.insertMany(notifications);

    // Global refresh for library UI
    const io = req.app.get('io');
    if (io) {
      io.emit('refreshData'); 
      io.emit('notification'); // Trigger socket notification count refresh
    }

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Only creator or admin can delete
    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('uploadedBy', 'name role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
