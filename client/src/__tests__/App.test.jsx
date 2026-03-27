import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../App";

// Mock the fetch API globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock streaming response for /api/execute
function mockStreamResponse(chunks) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            chunks.forEach((chunk) =>
                controller.enqueue(encoder.encode(chunk))
            );
            controller.close();
        },
    });
    return { ok: true, body: stream, getReader: () => stream.getReader() };
}

describe("App - Initial Render", () => {
    it("renders the InfraStack title", () => {
        render(<App />);
        expect(screen.getByRole("heading", { name: /InfraStack/i })).toBeInTheDocument();
    });

    it("renders the welcome message from AI", () => {
        render(<App />);
        expect(screen.getByText(/Hello! I am InfraStack/i)).toBeInTheDocument();
    });

    it("renders the input field and send button", () => {
        render(<App />);
        expect(screen.getByPlaceholderText(/Ask to install/i)).toBeInTheDocument();
    });
});

describe("App - Sending a message", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows the user's message in the chat after sending", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                explanation: "I will install htop",
                command: "apk add htop",
                isSafe: true,
                warning: "",
            }),
        });

        render(<App />);
        const input = screen.getByPlaceholderText(/Ask to install/i);
        await userEvent.type(input, "install htop");
        fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(screen.getByText("install htop")).toBeInTheDocument();
        });
    });

    it("displays the AI explanation and proposed command after fetch", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                explanation: "I will install htop using apk.",
                command: "apk add htop",
                isSafe: true,
                warning: "Requires root.",
            }),
        });

        render(<App />);
        const input = screen.getByPlaceholderText(/Ask to install/i);
        await userEvent.type(input, "install htop");
        fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(screen.getByText(/I will install htop using apk./i)).toBeInTheDocument();
            expect(screen.getByText("apk add htop")).toBeInTheDocument();
            expect(screen.getByText(/Requires root/i)).toBeInTheDocument();
        });
    });

    it("shows an error message if backend is unreachable", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        render(<App />);
        const input = screen.getByPlaceholderText(/Ask to install/i);
        await userEvent.type(input, "install git");
        fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(screen.getByText(/Error: Failed to connect/i)).toBeInTheDocument();
        });
    });
});
