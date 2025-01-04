const express = require('express');
const router = express.Router();
const { generateTokens, verifyToken, handleRefreshToken } = require('../middleware/verify');

const users = {
  user: { id: '1', email: 'user@test.com', password: 'user123', role: 'user' },
  admin: { id: '2', email: 'admin@test.com', password: 'admin123', role: 'admin' },
};

// Login Route
router.post('/login', (req, res) => {
  const { type } = req.body;

  const user = users[type];
  if (!user) {
    return res.status(400).json({ message: 'Invalid user type' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 1000, // 1 minute
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.json({ message: `${type} logged in successfully`, role: user.role });
});

// Refresh Token Route
router.get('/refresh_token', handleRefreshToken);

// Protected Routes
// Protected Routes
router.post('/user/test_process_token', verifyToken(['user']), (req, res) => {
  const value = Math.random() * 100;  // You can replace this with actual meaningful data
  const timestamp = new Date().toISOString();  // Format the timestamp to ISO string

  res.json({ value, timestamp });
});

router.post('/admin/test_process_token', verifyToken(['admin']), (req, res) => {
  const value = Math.random() * 100;  // You can replace this with actual meaningful data
  const timestamp = new Date().toISOString();  // Format the timestamp to ISO string

  res.json({ value, timestamp });
});


module.exports = router;
