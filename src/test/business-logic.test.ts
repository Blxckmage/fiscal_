import { describe, it, expect, vi, beforeEach } from "vitest";

// Example: Testing business logic that would be used in tRPC routers

describe("Transaction Business Logic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("calculateBalance", () => {
		it("should calculate positive balance with income > expenses", () => {
			const income = 5000;
			const expenses = 3000;
			const balance = income - expenses;

			expect(balance).toBe(2000);
			expect(balance).toBeGreaterThan(0);
		});

		it("should calculate negative balance with expenses > income", () => {
			const income = 2000;
			const expenses = 3000;
			const balance = income - expenses;

			expect(balance).toBe(-1000);
			expect(balance).toBeLessThan(0);
		});

		it("should handle zero income", () => {
			const income = 0;
			const expenses = 1000;
			const balance = income - expenses;

			expect(balance).toBe(-1000);
		});

		it("should handle zero expenses", () => {
			const income = 5000;
			const expenses = 0;
			const balance = income - expenses;

			expect(balance).toBe(5000);
		});
	});

	describe("formatCurrency", () => {
		const formatCurrency = (amount: number) => {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
			}).format(amount);
		};

		it("should format positive amounts", () => {
			const formatted = formatCurrency(1000000);
			expect(formatted).toContain("1.000.000");
		});

		it("should format negative amounts", () => {
			const formatted = formatCurrency(-500000);
			expect(formatted).toContain("500.000");
		});

		it("should format zero", () => {
			const formatted = formatCurrency(0);
			expect(formatted).toContain("0");
		});
	});

	describe("validateTransaction", () => {
		const validateTransaction = (data: {
			amount: number;
			description: string;
			categoryId: string;
		}) => {
			const errors: string[] = [];

			if (data.amount <= 0) {
				errors.push("Amount must be greater than zero");
			}

			if (!data.description || data.description.trim().length === 0) {
				errors.push("Description is required");
			}

			if (!data.categoryId) {
				errors.push("Category is required");
			}

			return {
				isValid: errors.length === 0,
				errors,
			};
		};

		it("should validate correct transaction data", () => {
			const result = validateTransaction({
				amount: 100,
				description: "Grocery shopping",
				categoryId: "cat-123",
			});

			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject zero amount", () => {
			const result = validateTransaction({
				amount: 0,
				description: "Test",
				categoryId: "cat-123",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Amount must be greater than zero");
		});

		it("should reject negative amount", () => {
			const result = validateTransaction({
				amount: -100,
				description: "Test",
				categoryId: "cat-123",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Amount must be greater than zero");
		});

		it("should reject empty description", () => {
			const result = validateTransaction({
				amount: 100,
				description: "",
				categoryId: "cat-123",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Description is required");
		});

		it("should reject missing category", () => {
			const result = validateTransaction({
				amount: 100,
				description: "Test",
				categoryId: "",
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Category is required");
		});
	});
});
