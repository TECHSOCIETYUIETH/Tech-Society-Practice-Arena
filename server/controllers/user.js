// controllers/user.js
const User = require('../models/User');

// @desc    Get all students (for assignment “visible to” list)
// @route   GET /api/users
// @access  Admin/Mentor
exports.getUsers = async (req, res, next) => {
  try {
    // only students
    const students = await User.find({ role: 'student', isActive: true })
      .select('name email'); 
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};
