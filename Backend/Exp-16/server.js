const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== 'mysecrettoken') {
    return res.status(403).json({ message: 'Invalid token' });
  }

  next();
}

// Public Route
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Protected Route
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// Admin Router (Protected)
const router = express.Router();

router.use((req, res, next) => {
  console.log('Admin router middleware executed');
  next();
});

router.get('/dashboard', (req, res) => {
  res.send('Admin dashboard');
});

app.use('/admin', authMiddleware, router);

// CRUD for Users
let users = [];

app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json({ message: 'User added', user });
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
});

app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  users = users.map(user => (user.id === id ? updatedUser : user));
  res.status(200).json({ message: 'User updated', updatedUser });
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  users = users.filter(user => user.id !== id);
  res.status(200).json({ message: 'User deleted' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
