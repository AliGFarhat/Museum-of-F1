const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'credentials.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Setup middleware
app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:5500'] })); // Allow requests from your frontend's origin
app.use(express.json()); // To parse JSON bodies

// Setup email sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Check email connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// Feedback route
app.post('/send-feedback', (req, res) => {
    const { email, feedback } = req.body;

    if (!email || !feedback) {
        return res.status(400).send('Email and feedback are required.');
    }

    const mailOptions = {
        from: `Feedback Form <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send the email to yourself
        replyTo: email, // So you can reply directly to the user
        subject: `New Website Feedback from ${email}`,
        text: `You have received new feedback.\n\nFrom: ${email}\n\nMessage:\n${feedback}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending feedback.');
        }
        console.log('Email sent: ' + info.response);
        res.status(200).send('Thank you for your feedback!');
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
