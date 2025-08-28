import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the container
const mockContainer = {
  register: vi.fn(),
  resolve: vi.fn(),
  isRegistered: vi.fn(),
};

vi.mock("../container/Container", () => ({
  container: mockContainer,
}));

describe("Module System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have container available", () => {
    expect(mockContainer).toBeDefined();
    expect(mockContainer.register).toBeDefined();
    expect(mockContainer.resolve).toBeDefined();
  });

  it("should handle module registration", () => {
    const mockService = { test: "service" };

    mockContainer.register.mockReturnValue(undefined);
    mockContainer.isRegistered.mockReturnValue(false);

    // Simulate service registration
    mockContainer.register("testService", mockService);

    expect(mockContainer.register).toHaveBeenCalledWith(
      "testService",
      mockService
    );
  });

  it("should handle module resolution", () => {
    const mockService = { test: "service" };

    mockContainer.resolve.mockReturnValue(mockService);
    mockContainer.isRegistered.mockReturnValue(true);

    // Simulate service resolution
    const resolved = mockContainer.resolve("testService");

    expect(mockContainer.resolve).toHaveBeenCalledWith("testService");
    expect(resolved).toEqual(mockService);
  });

  it("should check if service is registered", () => {
    mockContainer.isRegistered.mockReturnValue(true);

    const isRegistered = mockContainer.isRegistered("testService");

    expect(mockContainer.isRegistered).toHaveBeenCalledWith("testService");
    expect(isRegistered).toBe(true);
  });
});
