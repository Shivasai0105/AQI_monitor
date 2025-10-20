const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

function createAuthRouter(users) {
    const router = express.Router();

    // Signup Endpoint
    router.post("/signup", async (req, res) => {
        try {
            const { name, username, email, password } = req.body;

            // Input validation
            if (!name || !username || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            if (name.length < 2) {
                return res.status(400).json({ message: "Name must be at least 2 characters" });
            }
            if (username.length < 4) {
                return res.status(400).json({ message: "Username must be at least 4 characters" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }

            const existingUser = await users.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }
            const existingEmail = await users.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await users.insertOne({
                name,
                username,
                email,
                password: hashedPassword,
                createdAt: new Date()
            });
            res.json({ message: "Signup successful" });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // Login Endpoint
    router.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: "Enter all fields" });
            }
            const user = await users.findOne({
                $or: [{ username }, { email: username }]
            });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).json({ message: "Wrong password" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    name: user.name,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // Forgot Password Endpoint
    router.post("/forgot-password", async (req, res) => {
        try {
            const { username } = req.body;
            if (!username) {
                return res.status(400).json({ message: "Username or email is required" });
            }
            const user = await users.findOne({
                $or: [{ username }, { email: username }]
            });
            if (!user) {
                return res.status(404).json({ message: "No account found with that username or email" });
            }

            // Generate reset token
            const resetToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Send email (configure nodemailer)
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            await transporter.sendMail(mailOptions);

            res.json({
                message: "Password reset instructions sent to your email",
                email: user.email
            });
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // Logout Endpoint
    router.post("/logout", (req, res) => {
        // In a stateless JWT setup, logout is handled client-side
        // But we can provide a server response for consistency
        res.json({ message: "Logged out successfully" });
    });

    return router;
}

module.exports = createAuthRouter;
