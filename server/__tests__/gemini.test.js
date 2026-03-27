const { generateCommand } = require("../gemini");

// Mock the GoogleGenerativeAI SDK
jest.mock("@google/generative-ai", () => {
    const mockGenerateContent = jest.fn();
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent,
            }),
        })),
        _mockGenerateContent: mockGenerateContent,
    };
});

const { _mockGenerateContent } = require("@google/generative-ai");

describe("generateCommand()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should parse a valid JSON response from Gemini", async () => {
        const fakeResponse = {
            explanation: "Install htop using apk.",
            command: "apk add htop",
            isSafe: true,
            warning: "Requires root.",
        };

        _mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(fakeResponse),
            },
        });

        const result = await generateCommand("install htop");

        expect(result.command).toBe("apk add htop");
        expect(result.isSafe).toBe(true);
        expect(result.explanation).toBe("Install htop using apk.");
    });

    it("should strip markdown fences if Gemini wraps JSON in code blocks", async () => {
        const fakeJson = JSON.stringify({
            explanation: "Check disk usage.",
            command: "df -h",
            isSafe: true,
            warning: "",
        });

        _mockGenerateContent.mockResolvedValue({
            response: { text: () => `\`\`\`json\n${fakeJson}\n\`\`\`` },
        });

        const result = await generateCommand("check disk usage");
        expect(result.command).toBe("df -h");
    });

    it("should return a fallback on unparseable response", async () => {
        _mockGenerateContent.mockResolvedValue({
            response: { text: () => "This is not JSON at all." },
        });

        const result = await generateCommand("do something weird");
        expect(result.command).toBeNull();
        expect(result.isSafe).toBe(false);
        expect(result.warning).toMatch(/error/i);
    });

    it("should handle Gemini API errors gracefully (via route)", async () => {
        _mockGenerateContent.mockRejectedValue(new Error("API key invalid"));
        await expect(generateCommand("install git")).rejects.toThrow("API key invalid");
    });
});
