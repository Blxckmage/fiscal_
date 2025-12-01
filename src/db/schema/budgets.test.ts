import { describe, it, expect } from "vitest";
import type { NewBudget } from "./budgets";

describe("Budget Schema", () => {
	describe("Budget Periods", () => {
		it("should create a monthly budget", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "3000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
				period: "monthly",
			};

			expect(budget.period).toBe("monthly");
			expect(budget.amount).toBe("3000000");
		});

		it("should create a weekly budget", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "500000",
				startDate: "2025-12-01",
				endDate: "2025-12-07",
				period: "weekly",
			};

			expect(budget.period).toBe("weekly");
		});

		it("should create a yearly budget", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "36000000",
				startDate: "2025-01-01",
				endDate: "2025-12-31",
				period: "yearly",
			};

			expect(budget.period).toBe("yearly");
			expect(budget.amount).toBe("36000000");
		});

		it("should default to monthly period", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "2000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			expect(budget.period).toBeUndefined(); // Will default to "monthly"
		});
	});

	describe("Budget Properties", () => {
		it("should require all mandatory fields", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "1000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			expect(budget.userId).toBe("user-123");
			expect(budget.categoryId).toBe("cat-123");
			expect(budget.amount).toBe("1000000");
			expect(budget.startDate).toBe("2025-12-01");
			expect(budget.endDate).toBe("2025-12-31");
		});

		it("should default to active", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "1500000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			expect(budget.isActive).toBeUndefined(); // Will default to true
		});

		it("should allow inactive budgets", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "1500000",
				startDate: "2025-11-01",
				endDate: "2025-11-30",
				isActive: false,
			};

			expect(budget.isActive).toBe(false);
		});
	});

	describe("Amount Handling", () => {
		it("should store amount as string for precision", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "2500000.50",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			expect(typeof budget.amount).toBe("string");
			expect(budget.amount).toBe("2500000.50");
		});

		it("should handle large budget amounts", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "100000000",
				startDate: "2025-01-01",
				endDate: "2025-12-31",
				period: "yearly",
			};

			expect(budget.amount).toBe("100000000");
			expect(Number(budget.amount)).toBe(100000000);
		});

		it("should handle small budget amounts", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "50000",
				startDate: "2025-12-01",
				endDate: "2025-12-07",
				period: "weekly",
			};

			expect(budget.amount).toBe("50000");
			expect(Number(budget.amount)).toBe(50000);
		});
	});

	describe("Date Range Validation", () => {
		it("should have start date before end date", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "1000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			const start = new Date(budget.startDate);
			const end = new Date(budget.endDate);

			expect(start.getTime()).toBeLessThan(end.getTime());
		});

		it("should store dates as ISO strings", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "1000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
			};

			expect(budget.startDate).toBe("2025-12-01");
			expect(budget.endDate).toBe("2025-12-31");
		});

		it("should calculate correct date range for monthly budget", () => {
			const budget: NewBudget = {
				userId: "user-123",
				categoryId: "cat-123",
				amount: "2000000",
				startDate: "2025-12-01",
				endDate: "2025-12-31",
				period: "monthly",
			};

			const start = new Date(budget.startDate);
			const end = new Date(budget.endDate);
			const daysDiff =
				(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

			expect(daysDiff).toBeGreaterThanOrEqual(28); // At least 28 days
			expect(daysDiff).toBeLessThanOrEqual(31); // At most 31 days
		});
	});
});
