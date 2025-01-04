

const jwt = require('jsonwebtoken');

// Dummy user data
const users = {
  user: {
    id: '1',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
  },
  admin: {
    id: '2',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  },
};

// Token generation
const generateTokens = (user) => {
  console.log('Generating tokens for', user.role);
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1m' } // 1 minute for testing
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret',
    { expiresIn: '1d' } // 1 day
  );

  return { accessToken, refreshToken };
};

// Middleware for token validation
const verifyToken = (roles) => (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Refresh token logic
const handleRefreshToken = (req, res) => {
  console.log("^^^^^^^^^^^^^^^^Refresh token logic^^^^^^^^^^^^^^^^^^^^")
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret');
    const user = Object.values(users).find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const { accessToken } = generateTokens(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 1000, // 1 minute
    });

    return res.json({ message: 'Access token refreshed successfully' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { generateTokens, verifyToken, handleRefreshToken };
