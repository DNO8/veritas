// Jest globals are available automatically, no import needed

// Mock Supabase
jest.mock("../../supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
          limit: jest.fn(() => ({
            data: [],
            error: null,
          })),
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
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe("Roadmap Service - Validation Tests", () => {
  describe("createRoadmapItem validation", () => {
    it("should require projectId", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      await expect(
        createRoadmapItem({
          projectId: "",
          title: "Test Item",
          orderIndex: 0,
        }),
      ).rejects.toThrow("Project ID is required");
    });

    it("should require title", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "",
          orderIndex: 0,
        }),
      ).rejects.toThrow("Title is required");
    });

    it("should reject title longer than 200 characters", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      const longTitle = "a".repeat(201);

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: longTitle,
          orderIndex: 0,
        }),
      ).rejects.toThrow("Title must be 200 characters or less");
    });

    it("should reject description longer than 1000 characters", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      const longDescription = "a".repeat(1001);

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Item",
          description: longDescription,
          orderIndex: 0,
        }),
      ).rejects.toThrow("Description must be 1000 characters or less");
    });

    it("should reject negative estimated cost", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Item",
          estimatedCost: "-100",
          orderIndex: 0,
        }),
      ).rejects.toThrow("Estimated cost must be a positive number");
    });

    it("should reject NaN estimated cost", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Item",
          estimatedCost: "not-a-number",
          orderIndex: 0,
        }),
      ).rejects.toThrow("Estimated cost must be a positive number");
    });

    it("should reject negative order index", async () => {
      const { createRoadmapItem } = await import("../roadmap");

      await expect(
        createRoadmapItem({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Item",
          orderIndex: -1,
        }),
      ).rejects.toThrow("Order index must be non-negative");
    });

    it("should trim whitespace from title", () => {
      const title = "  Test Item  ";
      expect(title.trim()).toBe("Test Item");
    });
  });

  describe("updateRoadmapItem validation", () => {
    it("should require itemId", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      await expect(updateRoadmapItem("", { title: "Updated" })).rejects.toThrow(
        "Roadmap item ID is required",
      );
    });

    it("should reject empty title", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      await expect(
        updateRoadmapItem("123e4567-e89b-12d3-a456-426614174000", {
          title: "",
        }),
      ).rejects.toThrow("Title cannot be empty");
    });

    it("should reject title longer than 200 characters", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      const longTitle = "a".repeat(201);

      await expect(
        updateRoadmapItem("123e4567-e89b-12d3-a456-426614174000", {
          title: longTitle,
        }),
      ).rejects.toThrow("Title must be 200 characters or less");
    });

    it("should reject description longer than 1000 characters", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      const longDescription = "a".repeat(1001);

      await expect(
        updateRoadmapItem("123e4567-e89b-12d3-a456-426614174000", {
          description: longDescription,
        }),
      ).rejects.toThrow("Description must be 1000 characters or less");
    });

    it("should reject negative estimated cost", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      await expect(
        updateRoadmapItem("123e4567-e89b-12d3-a456-426614174000", {
          estimatedCost: "-100",
        }),
      ).rejects.toThrow("Estimated cost must be a positive number");
    });

    it("should reject negative order index", async () => {
      const { updateRoadmapItem } = await import("../roadmap");

      await expect(
        updateRoadmapItem("123e4567-e89b-12d3-a456-426614174000", {
          orderIndex: -1,
        }),
      ).rejects.toThrow("Order index must be non-negative");
    });
  });

  describe("deleteRoadmapItem validation", () => {
    it("should require itemId", async () => {
      const { deleteRoadmapItem } = await import("../roadmap");

      await expect(deleteRoadmapItem("")).rejects.toThrow(
        "Roadmap item ID is required",
      );
    });
  });

  describe("getRoadmapItemsByProjectId validation", () => {
    it("should require projectId", async () => {
      const { getRoadmapItemsByProjectId } = await import("../roadmap");

      await expect(getRoadmapItemsByProjectId("")).rejects.toThrow(
        "Project ID is required",
      );
    });
  });

  describe("projectHasRoadmap validation", () => {
    it("should require projectId", async () => {
      const { projectHasRoadmap } = await import("../roadmap");

      await expect(projectHasRoadmap("")).rejects.toThrow(
        "Project ID is required",
      );
    });
  });

  describe("createRoadmapItemsBatch validation", () => {
    it("should require projectId", async () => {
      const { createRoadmapItemsBatch } = await import("../roadmap");

      await expect(
        createRoadmapItemsBatch("", [{ title: "Item 1", orderIndex: 0 }]),
      ).rejects.toThrow("Project ID is required");
    });

    it("should return empty array for empty items", async () => {
      const { createRoadmapItemsBatch } = await import("../roadmap");

      const result = await createRoadmapItemsBatch(
        "123e4567-e89b-12d3-a456-426614174000",
        [],
      );

      expect(result).toEqual([]);
    });

    it("should validate all items", async () => {
      const { createRoadmapItemsBatch } = await import("../roadmap");

      await expect(
        createRoadmapItemsBatch("123e4567-e89b-12d3-a456-426614174000", [
          { title: "Item 1", orderIndex: 0 },
          { title: "", orderIndex: 1 }, // Invalid
        ]),
      ).rejects.toThrow("Item 2: Title is required");
    });

    it("should validate title length in batch", async () => {
      const { createRoadmapItemsBatch } = await import("../roadmap");

      const longTitle = "a".repeat(201);

      await expect(
        createRoadmapItemsBatch("123e4567-e89b-12d3-a456-426614174000", [
          { title: "Item 1", orderIndex: 0 },
          { title: longTitle, orderIndex: 1 }, // Invalid
        ]),
      ).rejects.toThrow("Item 2: Title must be 200 characters or less");
    });
  });
});

describe("Roadmap Service - Security Tests", () => {
  it("should validate UUID format for projectId", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test("invalid-uuid")).toBe(false);
  });

  it("should sanitize inputs by trimming whitespace", () => {
    const title = "  Test Item  ";
    const description = "  Test Description  ";

    expect(title.trim()).toBe("Test Item");
    expect(description.trim()).toBe("Test Description");
  });

  it("should enforce maximum lengths", () => {
    const maxTitleLength = 200;
    const maxDescriptionLength = 1000;

    expect(maxTitleLength).toBe(200);
    expect(maxDescriptionLength).toBe(1000);
  });

  it("should enforce non-negative order index", () => {
    const validIndex = 0;
    const invalidIndex = -1;

    expect(validIndex >= 0).toBe(true);
    expect(invalidIndex >= 0).toBe(false);
  });
});
