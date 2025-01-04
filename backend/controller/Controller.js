const jwt = require('jsonwebtoken');

// Predefined users for testing
const users = {
    user: {
        id: '1',
        email: 'user@test.com',
        password: 'user123',
        role: 'user'
    },
    admin: {
        id: '2',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
    }
};

// Generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        'your_jwt_secret',  // Replace with process.env.JWT_SECRET in production
        { expiresIn: '1m' }  // 1 minute for testing
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        'your_refresh_secret',  // Replace with process.env.REFRESH_TOKEN_SECRET
        { expiresIn: '1d' }    // 1 day
    );

    return { accessToken, refreshToken };
};

// Login controller
const login = (req, res) => {
    const { type } = req.body;  // 'user' or 'admin'
    const user = users[type];

    if (!user) {
        return res.status(400).json({ message: 'Invalid user type' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookies
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 1000  // 1 minute
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000  // 1 day
    });

    console.log(`${type} logged in - New access token generated`);
    res.json({ message: `${type} logged in successfully`, role: user.role });
};

// Process token test endpoints
const userProcessToken = (req, res) => {
    console.log('User process verified with token');
    res.json({ timestamp: Date.now(), value: Math.random() * 100 });
};

const adminProcessToken = (req, res) => {
    console.log('Admin process verified with token');
    res.json({ timestamp: Date.now(), value: Math.random() * 100 });
};

module.exports = {
    login,
    userProcessToken,
    adminProcessToken
};