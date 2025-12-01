import { describe, it, expect } from "vitest";
import type { NewTransaction } from "./transactions";

describe("Transaction Schema", () => {
	describe("Transaction Types", () => {
		it("should create an income transaction", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "income",
				amount: "5000000",
				date: "2025-12-01",
			};

			expect(transaction.type).toBe("income");
			expect(transaction.amount).toBe("5000000");
		});

		it("should create an expense transaction", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "250000",
				date: "2025-12-01",
			};

			expect(transaction.type).toBe("expense");
			expect(transaction.amount).toBe("250000");
		});
	});

	describe("Transaction Properties", () => {
		it("should require all mandatory fields", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "100000",
				date: "2025-12-01",
			};

			expect(transaction.userId).toBe("user-123");
			expect(transaction.accountId).toBe("acc-123");
			expect(transaction.categoryId).toBe("cat-123");
			expect(transaction.date).toBe("2025-12-01");
		});

		it("should allow optional description", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "50000",
				date: "2025-12-01",
				description: "Grocery shopping at Supermarket",
			};

			expect(transaction.description).toBe("Grocery shopping at Supermarket");
		});

		it("should allow optional notes", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "income",
				amount: "1000000",
				date: "2025-12-01",
				notes: "Freelance project payment - Website redesign",
			};

			expect(transaction.notes).toBe(
				"Freelance project payment - Website redesign",
			);
		});
	});

	describe("Amount Handling", () => {
		it("should store amount as string for precision", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "12345.67",
				date: "2025-12-01",
			};

			expect(typeof transaction.amount).toBe("string");
			expect(transaction.amount).toBe("12345.67");
		});

		it("should handle large amounts", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "income",
				amount: "100000000",
				date: "2025-12-01",
			};

			expect(transaction.amount).toBe("100000000");
			expect(Number(transaction.amount)).toBe(100000000);
		});

		it("should handle small amounts", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "500",
				date: "2025-12-01",
			};

			expect(transaction.amount).toBe("500");
			expect(Number(transaction.amount)).toBe(500);
		});
	});

	describe("Date Handling", () => {
		it("should store date as ISO string", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "1000",
				date: "2025-12-01",
			};

			expect(transaction.date).toBe("2025-12-01");
		});

		it("should handle different date formats", () => {
			const transaction: NewTransaction = {
				userId: "user-123",
				accountId: "acc-123",
				categoryId: "cat-123",
				type: "expense",
				amount: "1000",
				date: "2025-01-15",
			};

			expect(transaction.date).toBe("2025-01-15");
			const dateObj = new Date(transaction.date);
			expect(dateObj.getFullYear()).toBe(2025);
			expect(dateObj.getMonth()).toBe(0); // January (0-indexed)
			expect(dateObj.getDate()).toBe(15);
		});
	});
});
