import "@testing-library/jest-dom";

// Mock browser APIs not available in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();
