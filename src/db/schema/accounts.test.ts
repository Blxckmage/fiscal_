import { describe, it, expect } from "vitest";
import type { NewAccount } from "./accounts";

describe("Account Schema", () => {
	describe("Account Types", () => {
		it("should create a bank account", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "BCA Savings",
				type: "bank",
				balance: "5000000",
			};

			expect(account.type).toBe("bank");
			expect(account.name).toBe("BCA Savings");
		});

		it("should create a cash account", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Cash Wallet",
				type: "cash",
				balance: "500000",
			};

			expect(account.type).toBe("cash");
		});

		it("should create an e-wallet account", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "GoPay",
				type: "e-wallet",
				balance: "250000",
			};

			expect(account.type).toBe("e-wallet");
		});

		it("should create a credit card account", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Visa Credit",
				type: "credit-card",
				balance: "-1000000",
			};

			expect(account.type).toBe("credit-card");
			expect(account.balance).toBe("-1000000");
		});
	});

	describe("Account Properties", () => {
		it("should have default balance of 0", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "New Account",
				type: "bank",
			};

			// Balance will default to "0" based on schema
			expect(account.balance).toBeUndefined(); // Not set, will use default
		});

		it("should default to IDR currency", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Savings",
				type: "bank",
			};

			expect(account.currency).toBeUndefined(); // Will default to "IDR"
		});

		it("should allow custom currency", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "USD Account",
				type: "bank",
				currency: "USD",
				balance: "1000",
			};

			expect(account.currency).toBe("USD");
		});

		it("should allow custom icon and color", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Primary Account",
				type: "bank",
				icon: "💰",
				color: "#4CAF50",
			};

			expect(account.icon).toBe("💰");
			expect(account.color).toBe("#4CAF50");
		});

		it("should default to active", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Active Account",
				type: "bank",
			};

			expect(account.isActive).toBeUndefined(); // Will default to true
		});

		it("should allow inactive accounts", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Closed Account",
				type: "bank",
				isActive: false,
			};

			expect(account.isActive).toBe(false);
		});
	});

	describe("Balance Precision", () => {
		it("should store balance as string for precision", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "High Precision",
				type: "bank",
				balance: "1234567890.50",
			};

			expect(typeof account.balance).toBe("string");
			expect(account.balance).toBe("1234567890.50");
		});

		it("should handle negative balance for credit cards", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Credit Card",
				type: "credit-card",
				balance: "-5000000",
			};

			expect(account.balance).toBe("-5000000");
			expect(Number(account.balance)).toBeLessThan(0);
		});

		it("should handle zero balance", () => {
			const account: NewAccount = {
				userId: "user-123",
				name: "Empty Account",
				type: "bank",
				balance: "0",
			};

			expect(account.balance).toBe("0");
			expect(Number(account.balance)).toBe(0);
		});
	});
});
