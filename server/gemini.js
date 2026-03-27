const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");
require("dotenv").config({ path: [".env.local", ".env"] });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Detect the OS and package manager at startup
function detectOsInfo() {
    try {
        const osRelease = execSync("cat /etc/os-release 2>/dev/null || echo 'ID=unknown'").toString();
        const idMatch = osRelease.match(/^ID=(.+)$/m);
        const id = idMatch ? idMatch[1].replace(/"/g, "").toLowerCase() : "unknown";

        const pkgManagers = {
            alpine: "apk",
            debian: "apt-get",
            ubuntu: "apt-get",
            centos: "yum",
            rhel: "yum",
            fedora: "dnf",
            arch: "pacman",
        };

        const pkg = pkgManagers[id] || "apt-get";
        console.log(`[InfraStack] Detected OS: ${id}, Package Manager: ${pkg}`);
        return { os: id, pkg };
    } catch {
        return { os: "unknown", pkg: "apt-get" };
    }
}

const { os: detectedOs, pkg: packageManager } = detectOsInfo();

async function generateCommand(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are an infrastructure expert. Your task is to translate natural language requests into safe, efficient shell commands for a Linux server.

    ENVIRONMENT CONTEXT (VERY IMPORTANT):
    - Operating System: ${detectedOs}
    - Package Manager: ${packageManager}
    - Always use "${packageManager}" for package installation. NEVER use apt-get, apt, yum, etc. unless they match the package manager above.
    
    CRITICAL RULES:
    1. Only return a JSON object. No markdown, no code fences, no extra text.
    2. The JSON object must have:
       - "explanation": A brief, human-friendly explanation of what the command does.
       - "command": The actual shell command to be executed. Must use the correct package manager.
       - "isSafe": Boolean indicating if the command is relatively safe (non-destructive).
       - "warning": Any potential risks or side effects.
    3. If the request is ambiguous, ask for clarification in "explanation" and set "command" to null.
    
    Example for Alpine (apk): {"explanation":"Install htop using apk.","command":"apk add htop","isSafe":true,"warning":"Requires root privileges."}`
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        const clean = text.replace(/```json|```/g, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        return {
            explanation: "I couldn't understand the request. Please try being more specific.",
            command: null,
            isSafe: false,
            warning: "Parsing error from AI response."
        };
    }
}

module.exports = { generateCommand };
