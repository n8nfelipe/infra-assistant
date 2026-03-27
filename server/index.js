const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { generateCommand } = require("./gemini");
const { executeCommand } = require("./executor");
require("dotenv").config({ path: [".env.local", ".env"] });

const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve Static Files for UI
app.use(express.static(path.join(__dirname, "../client/dist")));

app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const result = await generateCommand(prompt);
        res.json(result);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to generate command" });
    }
});

app.post("/api/execute", (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "Command is required" });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    executeCommand(
        command,
        (data) => {
            res.write(data);
        },
        (code) => {
            res.write(`\n--- Process finished with code ${code} ---\n`);
            res.end();
        },
        (err) => {
            res.write(`\n--- Process Error: ${err.message} ---\n`);
            res.end();
        }
    );
});

// Handle SPA Routing (works with all Express versions)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(port, () => {
    console.log(`InfraStack Backend running on port ${port}`);
});
