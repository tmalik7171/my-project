const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = 'mysecrettoken';

// ---------------- Logging Middleware ----------------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------- Sample User ----------------
const user = {
  username: 'tushar',
  password: '12345',
  balance: 1000
};

// ---------------- JWT Authentication Middleware ----------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded; // store decoded payload for use in routes
    next();
  });
}

// ---------------- Public Routes ----------------
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Login Route - returns JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// ---------------- Protected Banking Routes ----------------

// View Balance
app.get('/balance', authMiddleware, (req, res) => {
  res.json({ balance: user.balance });
});

// Deposit Money
app.post('/deposit', authMiddleware, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  user.balance += amount;
  res.json({ message: `Deposited ${amount}`, balance: user.balance });
});

// Withdraw Money
app.post('/withdraw', authMiddleware, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  if (amount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });

  user.balance -= amount;
  res.json({ message: `Withdrew ${amount}`, balance: user.balance });
});

// ---------------- Admin Router (Protected) ----------------
const adminRouter = express.Router();

adminRouter.use(authMiddleware, (req, res, next) => {
  console.log('Admin router middleware executed');
  next();
});

adminRouter.get('/dashboard', (req, res) => {
  res.send('Admin dashboard');
});

app.use('/admin', adminRouter);

// ---------------- CRUD for Users ----------------
let users = [];

app.post('/users', (req, res) => {
  const userData = req.body;
  users.push(userData);
  res.status(201).json({ message: 'User added', user: userData });
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
});

app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  users = users.map(u => (u.id === id ? updatedUser : u));
  res.status(200).json({ message: 'User updated', updatedUser });
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  users = users.filter(u => u.id !== id);
  res.status(200).json({ message: 'User deleted' });
});

// ---------------- Start Server ----------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
