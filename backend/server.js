const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
require('dotenv').config({ path: 'mongoatlas.env' });
require('dotenv').config({ path: 'credentials.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Content Schemas
const feedbackSchema = new mongoose.Schema({
    email: String,
    feedback: String,
    date: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

const raceSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });
const Race = mongoose.model('FeaturedRace', raceSchema);

const spotlightSchema = new mongoose.Schema({
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });
const Spotlight = mongoose.model('Spotlight', spotlightSchema);

// Verify email credentials are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Error: EMAIL_USER or EMAIL_PASS are missing from environment variables.");
}

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error connecting to email server:', error);
    }
});

// Helper function to escape regex characters
function escRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Routes

// Register Endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Check if user already exists (email or username)
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username: { $regex: new RegExp(`^${escRegex(username)}$`, 'i') } }] 
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { id: newUser._id, email: newUser.email, username: newUser.username, isAdmin: newUser.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user by Email OR Username
        // The frontend sends the input in the 'email' field
        const user = await User.findOne({
            $or: [{ email: email }, { username: { $regex: new RegExp(`^${escRegex(email)}$`, 'i') } }]
        });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Validate password (Plain text comparison)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete Account Endpoint
app.delete('/delete-account', async (req, res) => {
    try {
        console.log('Request to delete account received:', req.body);
        const { id } = req.body;
        await User.findByIdAndDelete(id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check Username Availability Endpoint
app.post('/check-username', async (req, res) => {
    try {
        const { username, excludeId } = req.body;
        const query = { username: { $regex: new RegExp(`^${escRegex(username)}$`, 'i') } };
        
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const user = await User.findOne(query);
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Change Username Endpoint
app.put('/change-username', async (req, res) => {
    try {
        const { id, newUsername } = req.body;
        
        // Check if taken
        const existingUser = await User.findOne({ 
            username: { $regex: new RegExp(`^${escRegex(newUsername)}$`, 'i') },
            _id: { $ne: id } // Exclude current user from check
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const updatedUser = await User.findByIdAndUpdate(id, { username: newUsername }, { new: true });
        res.json({ message: 'Username updated successfully', user: { id: updatedUser._id, email: updatedUser.email, username: updatedUser.username, isAdmin: updatedUser.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Feedback Endpoint
app.post('/send-feedback', async (req, res) => {
    try {
        const { email, feedback } = req.body;
        if (!email || !feedback) {
            return res.status(400).json({ message: 'Email and feedback are required.' });
        }
        const newFeedback = new Feedback({ email, feedback });
        await newFeedback.save();

        // 1. Send Notification to Admin (You)
        const adminMailOptions = {
            from: `Feedback Form <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Website Feedback from ${email}`,
            text: `You have received new feedback.\n\nFrom: ${email}\n\nMessage:\n${feedback}`,
        };
        await transporter.sendMail(adminMailOptions);

        // 2. Send Confirmation to User (The "Anyone else")
        const userMailOptions = {
            from: `Museum of F1 <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'We received your feedback',
            text: `Hi,\n\nThank you for your feedback!\n\nWe received:\n"${feedback}"\n\nBest regards,\nMuseum of F1`
        };
        // Attempt to send confirmation, log error if fails but don't stop response
        await transporter.sendMail(userMailOptions).catch(err => console.error("Confirmation email failed:", err));

        res.status(200).json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ message: 'Error saving feedback.' });
    }
});

// --- Admin Content Routes ---

// Feedback: Read & Delete
app.get('/admin/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ date: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

app.delete('/admin/feedback/:id', async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting feedback' });
    }
});

// Featured Race: Read, Create/Update
app.get('/content/featured', async (req, res) => {
    const race = await Race.findOne().sort({ updatedAt: -1 });
    res.json(race || {});
});

app.post('/content/featured', async (req, res) => {
    await Race.deleteMany({});
    const newRace = new Race(req.body);
    await newRace.save();
    res.json({ message: 'Featured race updated', race: newRace });
});

app.post('/content/featured/reset', async (req, res) => {
    try {
        const result = await Race.deleteMany({});
        console.log(`Reset Featured Race: Deleted ${result.deletedCount} documents.`);
        res.json({ message: 'Featured race reset to default', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error resetting featured race:', error);
        res.status(500).json({ message: 'Error resetting featured race' });
    }
});

// Spotlights: Read, Create, Update
app.get('/content/spotlights', async (req, res) => {
    const spotlight = await Spotlight.findOne().sort({ updatedAt: -1 });
    res.json(spotlight || {});
});

app.post('/content/spotlights', async (req, res) => {
    await Spotlight.deleteMany({});
    const newSpotlight = new Spotlight(req.body);
    await newSpotlight.save();
    res.json({ message: 'Spotlights updated', spotlight: newSpotlight });
});

app.post('/content/spotlights/reset', async (req, res) => {
    try {
        const result = await Spotlight.deleteMany({});
        res.json({ message: 'Spotlights reset to default', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting spotlights' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));