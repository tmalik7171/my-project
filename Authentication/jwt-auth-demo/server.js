const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Secret key for JWT signing
const JWT_SECRET = 'your_secret_key';

// Sample user (hardcoded)
const user = {
  id: 1,
  username: 'admin',
  password: 'password123' // In real apps, never store plain passwords!
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password match
  if (username === user.username && password === user.password) {
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // 1 hour expiration
    );

    // Decode token to get iat and exp
    const decoded = jwt.decode(token);

    // Send response in your required format
    res.json({
      message: "✅ Welcome to the protected route!",
      user: {
        id: user.id,
        username: user.username,
        iat: decoded.iat,
        exp: decoded.exp
      }
    });
  } else {
    res.status(401).json({ message: "❌ Invalid username or password" });
  }
});

// Example protected route
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ message: "You have access to the protected route!" });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
