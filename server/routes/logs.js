const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth/token");

const router = express.Router();

// Middleware to require authentication
const requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
};

// GET /api/logs - Get all logs for the authenticated user
router.get("/", requireAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, prompt, command, explanation, warning, output, exit_code, executed_at
             FROM command_logs
             WHERE user_id = $1
             ORDER BY executed_at DESC
             LIMIT 100`,
            [req.user.id]
        );
        res.json({ logs: result.rows });
    } catch (error) {
        console.error("Logs Error:", error);
        res.status(500).json({ error: "Failed to retrieve logs" });
    }
});

module.exports = { router, requireAuth };
