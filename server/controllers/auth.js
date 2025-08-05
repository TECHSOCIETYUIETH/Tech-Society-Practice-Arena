const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// @route   POST /api/auth/register
// @desc    Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // check existing
    if (await User.findOne({ email })) {
      return res.status(400).json({ success:false, message:'Email already in use' });
    }

    // hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password:hash, role });
   const payload = { id: user._id, role: user.role };
 const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      success: true,
      data: { user: { id:user._id,name:user.name,email:user.email,role:user.role }, token }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/login
// @desc    Login and get a token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success:false, message:'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success:false, message:'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
 const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { user: { id:user._id,name:user.name,email:user.email,role:user.role }, token }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
exports.getMe = async (req, res, next) => {
  try {
    // auth middleware sets req.user
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success:true, data:user });
  } catch (err) {
    next(err);
  }
};
