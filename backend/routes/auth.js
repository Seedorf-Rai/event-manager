const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// ✅ safer token generator (checks env)
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ REGISTER
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, registrationNo, role } = req.body;

    // ✅ basic validation
    if (!name || !email || !password || !registrationNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { registrationNo }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email or Registration No already exists'
      });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    const user = await User.create({
      name,
      email,
      password,
      registrationNo,
      photo,
      role: role === 'admin' ? 'admin' : 'user'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNo: user.registrationNo,
        photo: user.photo,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error); // ✅ better debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNo: user.registrationNo,
        photo: user.photo,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET CURRENT USER
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;