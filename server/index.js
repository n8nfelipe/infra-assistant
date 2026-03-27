const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { generateCommand } = require("./gemini");
const { executeCommand } = require("./executor");
const authRoutes = require("./routes/auth");
const { router: logsRouter, requireAuth } = require("./routes/logs");
const db = require("./db");
const shell = require("shelljs");
const { verifyToken } = require("./auth/token");
require("dotenv").config({ path: [".env.local", ".env"] });

const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Initialize Database Schema
const initDb = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, "db/schema.sql"), "utf8");
        await db.query(schema);
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
};
initDb();

// Helper: get current user from cookie (optional)
const getUserFromCookie = (req) => {
    const token = req.cookies.token;
    if (!token) return null;
    return verifyToken(token);
};

// Auth Routes
app.use("/api/auth", authRoutes);

// Logs Routes
app.use("/api/logs", logsRouter);

// Containers API
app.get("/api/containers", requireAuth, (req, res) => {
    // Run docker ps and get output as JSON objects (one per line)
    const result = shell.exec("docker ps --format '{{json .}}'", { silent: true });
    
    if (result.code !== 0) {
        return res.status(500).json({ error: "Failed to list containers" });
    }

    const containers = result.stdout
        .trim()
        .split("\n")
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));

    res.json({ containers });
});

// Serve Static Files for UI
app.use(express.static(path.join(__dirname, "../client/dist")));

app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const result = await generateCommand(prompt);

        // Save log entry (without output/exit_code — those come on execute)
        const user = getUserFromCookie(req);
        if (user) {
            await db.query(
                `INSERT INTO command_logs (user_id, prompt, command, explanation, warning)
                 VALUES ($1, $2, $3, $4, $5)`,
                [user.id, prompt, result.command || null, result.explanation || null, result.warning || null]
            );
        }

        res.json(result);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to generate command" });
    }
});

app.post("/api/execute", (req, res) => {
    const { command, prompt } = req.body;
    if (!command) return res.status(400).json({ error: "Command is required" });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullOutput = "";

    executeCommand(
        command,
        (data) => {
            fullOutput += data;
            res.write(data);
        },
        async (code) => {
            res.write(`\n--- Process finished with code ${code} ---\n`);
            res.end();

            // Update the most recent log entry for this user+command with output
            const user = getUserFromCookie(req);
            if (user) {
                await db.query(
                    `UPDATE command_logs
                     SET output = $1, exit_code = $2
                     WHERE id = (
                         SELECT id FROM command_logs
                         WHERE user_id = $3 AND command = $4
                         ORDER BY executed_at DESC
                         LIMIT 1
                     )`,
                    [fullOutput, code, user.id, command]
                ).catch((err) => console.error("Log update error:", err));
            }
        },
        (err) => {
            res.write(`\n--- Process Error: ${err.message} ---\n`);
            res.end();
        }
    );
});

// Handle SPA Routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(port, () => {
    console.log(`InfraStack Backend running on port ${port}`);
});
