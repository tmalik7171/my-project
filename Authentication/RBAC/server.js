const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.set('json spaces', 2);

// JWT Secret Key
const JWT_SECRET = 'your_secret_key';

// Hardcoded users (for testing)
const users = [
  { id: 1, username: 'adminUser', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'modUser', password: 'mod123', role: 'Moderator' },
  { id: 3, username: 'normalUser', password: 'user123', role: 'User' }
];

// ---------------- LOGIN ROUTE ----------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Create JWT token with role info
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({ token });
});

// ---------------- VERIFY TOKEN MIDDLEWARE ----------------
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// ---------------- ROLE-BASED ACCESS MIDDLEWARE ----------------
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }

    next();
  };
}

// ---------------- PROTECTED ROUTES ----------------

// Admin Dashboard
app.get('/admin-dashboard', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Admin dashboard',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      iat: req.user.iat,
      exp: req.user.exp
    }
  });
});

// Moderator Panel
app.get('/moderator-panel', verifyToken, authorizeRoles('Moderator'), (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Moderator panel',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      iat: req.user.iat,
      exp: req.user.exp
    }
  });
});

// User Profile
app.get('/user-profile', verifyToken, authorizeRoles('User', 'Admin', 'Moderator'), (req, res) => {
  res.status(200).json({
    message: `Welcome to your profile, ${req.user.username}`,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      iat: req.user.iat,
      exp: req.user.exp
    }
  });
});

// ---------------- START SERVER ----------------
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
