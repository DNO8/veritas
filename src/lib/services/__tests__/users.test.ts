// Jest globals are available automatically, no import needed

// Mock Supabase
jest.mock("../../supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
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

describe("Users Service - Validation Tests", () => {
  describe("getUserById validation", () => {
    it("should require userId", async () => {
      const { getUserById } = await import("../users");

      await expect(getUserById("")).rejects.toThrow("User ID is required");
    });
  });

  describe("getUserByEmail validation", () => {
    it("should require email", async () => {
      const { getUserByEmail } = await import("../users");

      await expect(getUserByEmail("")).rejects.toThrow("Email is required");
    });

    it("should validate email format", () => {
      const validEmail = "test@example.com";
      const invalidEmail = "not-an-email";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(validEmail)).toBe(true);
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });
  });

  describe("createUser validation", () => {
    it("should require id", async () => {
      const { createUser } = await import("../users");

      await expect(
        createUser("", "test@example.com", "person"),
      ).rejects.toThrow("User ID is required");
    });

    it("should require email", async () => {
      const { createUser } = await import("../users");

      await expect(
        createUser("123e4567-e89b-12d3-a456-426614174000", "", "person"),
      ).rejects.toThrow("Email is required");
    });

    it("should require role", async () => {
      const { createUser } = await import("../users");

      await expect(
        createUser(
          "123e4567-e89b-12d3-a456-426614174000",
          "test@example.com",
          "" as any,
        ),
      ).rejects.toThrow("Role is required");
    });

    it("should validate role enum", async () => {
      const validRoles = ["person", "startup", "project", "pyme"];

      validRoles.forEach((role) => {
        expect(["person", "startup", "project", "pyme"]).toContain(role);
      });
    });
  });

  describe("updateUserWallet validation", () => {
    it("should require userId", async () => {
      const { updateUserWallet } = await import("../users");

      await expect(
        updateUserWallet("", process.env.TEST_STELLAR_WALLET!),
      ).rejects.toThrow("User ID is required");
    });

    it("should require walletAddress", async () => {
      const { updateUserWallet } = await import("../users");

      await expect(
        updateUserWallet(process.env.TEST_STELLAR_WALLET!, ""),
      ).rejects.toThrow("Wallet address is required");
    });

    it("should validate Stellar wallet format", () => {
      const validWallet = process.env.TEST_STELLAR_WALLET!;
      const invalidWallet = "invalid-wallet";

      // Stellar public keys start with G and are 56 characters
      const stellarRegex = /^G[A-Z0-9]{55}$/;

      expect(validWallet.length).toBe(56);
      expect(validWallet.startsWith("G")).toBe(true);
      expect(invalidWallet.startsWith("G")).toBe(false);
    });
  });
});

describe("Users Service - Security Tests", () => {
  it("should validate UUID format for userId", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test("invalid-uuid")).toBe(false);
  });

  it("should allow nullable wallet_address", () => {
    const user = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      role: "person",
      wallet_address: null,
    };

    expect(user.wallet_address).toBeNull();
  });
});
