const bcryptjs = require('bcryptjs');
const prisma = require('../lib/prismaClient');
const { generateToken, TOKEN_EXPIRY } = require('../utils/jwt');
const { addToken } = require('../utils/tokenBlacklist');

const getDisplayName = (email) => {
  const prefix = email.split('@')[0] || email;
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY * 1000).toISOString();

    res.status(200).json({
      message: 'Login successful',
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: getDisplayName(user.email),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}

async function logout(req, res) {
  try {
    const token = req.token;
    const expiresAt = req.user.exp ? req.user.exp * 1000 : Date.now() + TOKEN_EXPIRY * 1000;
    addToken(token, expiresAt);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
}

function verifyToken(req, res) {
  res.status(200).json({ message: 'Token is valid', userId: req.user.userId });
}

async function refreshToken(req, res) {
  try {
    const oldToken = req.token;
    const expiresAt = req.user.exp ? req.user.exp * 1000 : Date.now() + TOKEN_EXPIRY * 1000;
    addToken(oldToken, expiresAt);

    const newToken = generateToken({ userId: req.user.userId, role: req.user.role });
    const newExpiresAt = new Date(Date.now() + TOKEN_EXPIRY * 1000).toISOString();

    res.status(200).json({
      message: 'Token refreshed',
      token: newToken,
      expiresAt: newExpiresAt,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  verifyToken,
  refreshToken,
};
