const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { generateToken, verifyToken } = require("../auth/token");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, passwordHash]
        );
        const user = result.rows[0];
        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({ user });
    } catch (error) {
        if (error.code === "23505") { // Unique violation
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
});

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

// Me (Get current user)
router.get("/me", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });

    try {
        const result = await db.query("SELECT id, email FROM users WHERE id = $1", [decoded.id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (error) {
        console.error("Me Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
