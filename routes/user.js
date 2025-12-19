const express = require('express');
const { auth } = require('../Authorization/auth');
const { User } = require('../Model/model');

const router = express.Router();

// PROFILE
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

module.exports = router;
