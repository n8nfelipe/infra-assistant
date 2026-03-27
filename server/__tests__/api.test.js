const request = require("supertest");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// --- Mock modules before requiring the app ---
jest.mock("../gemini", () => ({
    generateCommand: jest.fn(),
}));

jest.mock("../executor", () => ({
    executeCommand: jest.fn(),
}));

const { generateCommand } = require("../gemini");
const { executeCommand } = require("../executor");

// Build a minimal test version of the app (not starting the real listener)
function buildApp() {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.post("/api/generate", async (req, res) => {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        try {
            const result = await generateCommand(prompt);
            res.json(result);
        } catch {
            res.status(500).json({ error: "Failed to generate command" });
        }
    });

    app.post("/api/execute", (req, res) => {
        const { command } = req.body;
        if (!command) return res.status(400).json({ error: "Command is required" });

        res.setHeader("Content-Type", "text/plain");
        executeCommand(
            command,
            (data) => res.write(data),
            (code) => { res.write(`\n--- code ${code} ---`); res.end(); },
            (err) => { res.write(err.message); res.end(); }
        );
    });

    return app;
}

describe("POST /api/generate", () => {
    let app;

    beforeAll(() => { app = buildApp(); });
    beforeEach(() => jest.clearAllMocks());

    it("returns 400 when prompt is missing", async () => {
        const res = await request(app).post("/api/generate").send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Prompt is required");
    });

    it("returns generated command on success", async () => {
        generateCommand.mockResolvedValue({
            explanation: "Install git",
            command: "apk add git",
            isSafe: true,
            warning: "",
        });

        const res = await request(app)
            .post("/api/generate")
            .send({ prompt: "install git" });

        expect(res.status).toBe(200);
        expect(res.body.command).toBe("apk add git");
        expect(generateCommand).toHaveBeenCalledWith("install git");
    });

    it("returns 500 when Gemini throws", async () => {
        generateCommand.mockRejectedValue(new Error("API error"));

        const res = await request(app)
            .post("/api/generate")
            .send({ prompt: "install git" });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Failed to generate command");
    });
});

describe("POST /api/execute", () => {
    let app;

    beforeAll(() => { app = buildApp(); });
    beforeEach(() => jest.clearAllMocks());

    it("returns 400 when command is missing", async () => {
        const res = await request(app).post("/api/execute").send({});
        expect(res.status).toBe(400);
    });

    it("streams executor output", async () => {
        executeCommand.mockImplementation((cmd, onData, onEnd) => {
            onData("output line\n");
            onEnd(0);
        });

        const res = await request(app)
            .post("/api/execute")
            .send({ command: "echo test" });

        expect(res.text).toContain("output line");
        expect(res.text).toContain("code 0");
    });
});
