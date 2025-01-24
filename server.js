const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kanji-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    progress: {
        kanjiList: Array,
        noIdeaList: Array,
        seenButNoIdeaList: Array,
        rememberedList: Array,
        currentSetTitle: String,
    },
});

const User = mongoose.model('User', userSchema);

// Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, progress: {} });
    await user.save();
    res.status(201).send('User registered');
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');
    res.json({ token });
});

// Save Progress Endpoint
app.post('/save-progress', async (req, res) => {
    const { token, progress } = req.body;
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);
        user.progress = progress;
        await user.save();
        res.send('Progress saved');
    } catch (error) {
        res.status(400).send('Invalid token');
    }
});

// Load Progress Endpoint
app.post('/load-progress', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);
        res.json(user.progress);
    } catch (error) {
        res.status(400).send('Invalid token');
    }
});

// Start Server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});