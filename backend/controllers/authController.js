const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user (Admin Only)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      rollNo, uniRegNo, employeeId, department, semester, section, batch 
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    if (rollNo) {
      const rollExists = await User.findOne({ rollNo });
      if (rollExists) return res.status(400).json({ message: 'Roll number already in use' });
    }

    // Extract initials
    const initials = name 
      ? name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 3)
      : '??';

    const user = await User.create({
      name, email, password, role, initials,
      rollNo, uniRegNo, employeeId, department, semester, section, batch,
      isVerified: true
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user by email OR roll number
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { rollNo: email || '' }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/roll number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.initials = user.name
        ? user.name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 3)
        : user.initials;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        initials: updatedUser.initials,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
exports.updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update any user
// @route   PUT /api/users/:id
exports.adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.rollNo = req.body.rollNo || user.rollNo;
    user.semester = req.body.semester !== undefined ? req.body.semester : user.semester;
    user.department = req.body.department || user.department;
    user.section = req.body.section || user.section;
    user.status = req.body.status || user.status;
    
    user.initials = user.name
      ? user.name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 3)
      : user.initials;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete any user
// @route   DELETE /api/users/:id
exports.adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot delete their own accounts from this panel.' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
