const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketio = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/chatdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Message model
const Message = mongoose.model('Message', {
  text: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});

// API routes
app.get('/api/messages', authenticate, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ timestamp: 1 })
      .populate('user', 'username _id'); // Ensure user is populated
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { text, user } = req.body;
    const message = new Message({ text, user });
    await message.save();
    
    // Emit the new message to all connected clients
    io.emit('newMessage', message);
    
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});