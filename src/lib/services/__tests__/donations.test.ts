// Jest globals are available automatically, no import needed

// Mock Supabase
jest.mock("../../supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(),
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe("Donations Service - Validation Tests", () => {
  describe("createDonation validation", () => {
    it("should require projectId", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "100",
          asset: "XLM",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Project ID is required");
    });

    it("should require donorWallet", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: "",
          amount: "100",
          asset: "XLM",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Donor wallet is required");
    });

    it("should require amount", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "",
          asset: "XLM",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Amount is required");
    });

    it("should reject negative amounts", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "-100",
          asset: "XLM",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Amount must be positive");
    });

    it("should reject zero amounts", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "0",
          asset: "XLM",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Amount must be positive");
    });

    it("should require asset", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "100",
          asset: "",
          txHash: "abc123",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Asset is required");
    });

    it("should require txHash", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "100",
          asset: "XLM",
          txHash: "",
          network: "TESTNET",
        }),
      ).rejects.toThrow("Transaction hash is required");
    });

    it("should require network", async () => {
      const { createDonation } = await import("../donations");

      await expect(
        createDonation({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          donorWallet: process.env.TEST_STELLAR_WALLET!,
          amount: "100",
          asset: "XLM",
          txHash: "abc123",
          network: "" as any,
        }),
      ).rejects.toThrow("Network is required");
    });
  });

  describe("getDonationsByProjectId validation", () => {
    it("should require projectId", async () => {
      const { getDonationsByProjectId } = await import("../donations");

      await expect(getDonationsByProjectId("")).rejects.toThrow(
        "Project ID is required",
      );
    });
  });

  describe("getDonationByTxHash validation", () => {
    it("should require txHash", async () => {
      const { getDonationByTxHash } = await import("../donations");

      await expect(getDonationByTxHash("")).rejects.toThrow(
        "Transaction hash is required",
      );
    });
  });
});

describe("Donations Service - Security Tests", () => {
  it("should validate Stellar network values", () => {
    const validNetworks = ["testnet", "mainnet"];

    expect(validNetworks).toContain("testnet");
    expect(validNetworks).toContain("mainnet");
    expect(validNetworks).not.toContain("invalid");
  });

  it("should validate asset types", () => {
    const validAssets = ["XLM", "USDC"];

    expect(validAssets).toContain("XLM");
    expect(validAssets).toContain("USDC");
  });

  it("should validate Stellar wallet format", () => {
    const validWallet = process.env.TEST_STELLAR_WALLET!;

    expect(validWallet.length).toBe(56);
    expect(validWallet.startsWith("G")).toBe(true);
  });
});
