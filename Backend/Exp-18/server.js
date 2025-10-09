const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  balance: Number
});

const User = mongoose.model('User', userSchema);

// 1. Create sample users
app.post('/create-users', async (req, res) => {
  try {
    const users = [
      { name: 'Alice', balance: 1000 },
      { name: 'Bob', balance: 500 }
    ];
    const createdUsers = await User.insertMany(users);
    res.status(201).json({ message: 'Users created', users: createdUsers });
  } catch (err) {
    res.status(500).json({ message: 'Error creating users', error: err.message });
  }
});

// 2. Transfer endpoint
app.post('/transfer', async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  if (!fromUserId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  try {
    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Sequential updates
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Transfer failed', error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
