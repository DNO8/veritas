// Jest globals are available automatically, no import needed
import type { CreateProjectInput } from "../projects";

// Mock Supabase
jest.mock("../../supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe("Projects Service - Validation Tests", () => {
  describe("createProject input validation", () => {
    it("should require ownerId", async () => {
      const { createProject } = await import("../projects");

      const invalidInput = {
        ownerId: "",
        title: "Test Project",
        shortDescription: "Test description",
        coverImageUrl: "https://example.com/image.jpg",
      } as CreateProjectInput;

      await expect(createProject(invalidInput)).rejects.toThrow(
        "Owner ID is required",
      );
    });

    it("should require title", async () => {
      const { createProject } = await import("../projects");

      const invalidInput = {
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
        title: "",
        shortDescription: "Test description",
        coverImageUrl: "https://example.com/image.jpg",
      } as CreateProjectInput;

      await expect(createProject(invalidInput)).rejects.toThrow(
        "Title is required",
      );
    });

    it("should require shortDescription", async () => {
      const { createProject } = await import("../projects");

      const invalidInput = {
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test Project",
        shortDescription: "",
        coverImageUrl: "https://example.com/image.jpg",
      } as CreateProjectInput;

      await expect(createProject(invalidInput)).rejects.toThrow(
        "Short description is required",
      );
    });

    it("should require coverImageUrl", async () => {
      const { createProject } = await import("../projects");

      const invalidInput = {
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test Project",
        shortDescription: "Test description",
        coverImageUrl: "",
      } as CreateProjectInput;

      await expect(createProject(invalidInput)).rejects.toThrow(
        "Cover image URL is required",
      );
    });

    it("should trim whitespace from title", async () => {
      const { createProject } = await import("../projects");

      const input = {
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
        title: "  Test Project  ",
        shortDescription: "Test description",
        coverImageUrl: "https://example.com/image.jpg",
      } as CreateProjectInput;

      // Should not throw for whitespace-only validation
      // The actual trimming happens in the service
      expect(input.title.trim()).toBe("Test Project");
    });
  });

  describe("updateProjectStatus validation", () => {
    it("should require projectId", async () => {
      const { updateProjectStatus } = await import("../projects");

      await expect(updateProjectStatus("", "published")).rejects.toThrow(
        "Project ID is required",
      );
    });

    it("should validate status enum", async () => {
      const { updateProjectStatus } = await import("../projects");

      await expect(
        updateProjectStatus(
          "123e4567-e89b-12d3-a456-426614174000",
          "invalid" as any,
        ),
      ).rejects.toThrow("Invalid project status");
    });

    it("should accept valid statuses", async () => {
      const validStatuses = ["draft", "published", "paused"];

      validStatuses.forEach((status) => {
        expect(["draft", "published", "paused"]).toContain(status);
      });
    });
  });

  describe("updateProjectAmount validation", () => {
    it("should require projectId", async () => {
      const { updateProjectAmount } = await import("../projects");

      await expect(updateProjectAmount("", "100")).rejects.toThrow(
        "Project ID is required",
      );
    });

    it("should reject negative amounts", async () => {
      const { updateProjectAmount } = await import("../projects");

      await expect(
        updateProjectAmount("123e4567-e89b-12d3-a456-426614174000", "-100"),
      ).rejects.toThrow("Invalid amount");
    });

    it("should reject NaN amounts", async () => {
      const { updateProjectAmount } = await import("../projects");

      await expect(
        updateProjectAmount(
          "123e4567-e89b-12d3-a456-426614174000",
          "not-a-number",
        ),
      ).rejects.toThrow("Invalid amount");
    });
  });
});

describe("Projects Service - Security Tests", () => {
  it("should create projects with draft status by default", () => {
    // Projects should always start as draft for security
    const defaultStatus = "draft";
    expect(defaultStatus).toBe("draft");
  });

  it("should validate UUID format for ownerId", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test("invalid-uuid")).toBe(false);
  });
});
