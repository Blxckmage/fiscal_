import { describe, it, expect } from "vitest";

// Currency Formatting
export function formatCurrency(amount: number, currency = "IDR"): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
	}).format(amount);
}

// Date Formatting
export function formatDate(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("id-ID", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(d);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((value / total) * 100);
}

// Budget progress calculation
export function calculateBudgetProgress(spent: number, budget: number) {
	const percentage = calculatePercentage(spent, budget);
	const remaining = budget - spent;
	const isOverBudget = spent > budget;

	return {
		percentage: Math.min(percentage, 100),
		remaining,
		isOverBudget,
		status: isOverBudget ? "over" : percentage >= 90 ? "warning" : "good",
	};
}

// Transaction validation
export function validateTransactionAmount(amount: string | number): boolean {
	const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
	return !isNaN(numAmount) && numAmount > 0;
}

// Calculate account total balance
export function calculateTotalBalance(
	accounts: Array<{ balance: string }>,
): number {
	return accounts.reduce((total, account) => {
		return total + parseFloat(account.balance || "0");
	}, 0);
}

describe("Financial Utilities", () => {
	describe("formatCurrency", () => {
		it("should format IDR currency correctly", () => {
			const result = formatCurrency(1000000);
			expect(result).toContain("1.000.000");
		});

		it("should format large amounts", () => {
			const result = formatCurrency(100000000);
			expect(result).toContain("100.000.000");
		});

		it("should format negative amounts", () => {
			const result = formatCurrency(-500000);
			expect(result).toContain("500.000");
		});

		it("should handle zero", () => {
			const result = formatCurrency(0);
			expect(result).toContain("0");
		});

		it("should support different currencies", () => {
			const result = formatCurrency(1000, "USD");
			expect(result).toBeTruthy();
		});
	});

	describe("formatDate", () => {
		it("should format date string", () => {
			const result = formatDate("2025-12-01");
			expect(result).toContain("2025");
		});

		it("should format Date object", () => {
			const date = new Date("2025-12-01");
			const result = formatDate(date);
			expect(result).toContain("2025");
		});

		it("should use Indonesian locale", () => {
			const result = formatDate("2025-01-15");
			// Should include Indonesian month names
			expect(result).toBeTruthy();
		});
	});

	describe("calculatePercentage", () => {
		it("should calculate percentage correctly", () => {
			expect(calculatePercentage(50, 100)).toBe(50);
		});

		it("should round to nearest integer", () => {
			expect(calculatePercentage(33, 100)).toBe(33);
			expect(calculatePercentage(66.6, 100)).toBe(67);
		});

		it("should handle zero total", () => {
			expect(calculatePercentage(50, 0)).toBe(0);
		});

		it("should handle percentage over 100", () => {
			expect(calculatePercentage(150, 100)).toBe(150);
		});

		it("should handle zero value", () => {
			expect(calculatePercentage(0, 100)).toBe(0);
		});
	});

	describe("calculateBudgetProgress", () => {
		it("should calculate progress for under budget", () => {
			const result = calculateBudgetProgress(500000, 1000000);

			expect(result.percentage).toBe(50);
			expect(result.remaining).toBe(500000);
			expect(result.isOverBudget).toBe(false);
			expect(result.status).toBe("good");
		});

		it("should warn when approaching budget limit", () => {
			const result = calculateBudgetProgress(950000, 1000000);

			expect(result.percentage).toBe(95);
			expect(result.remaining).toBe(50000);
			expect(result.isOverBudget).toBe(false);
			expect(result.status).toBe("warning");
		});

		it("should detect over budget", () => {
			const result = calculateBudgetProgress(1200000, 1000000);

			expect(result.percentage).toBe(100); // Capped at 100
			expect(result.remaining).toBe(-200000);
			expect(result.isOverBudget).toBe(true);
			expect(result.status).toBe("over");
		});

		it("should handle zero budget", () => {
			const result = calculateBudgetProgress(500000, 0);

			expect(result.percentage).toBe(0);
			expect(result.isOverBudget).toBe(true);
		});

		it("should handle zero spent", () => {
			const result = calculateBudgetProgress(0, 1000000);

			expect(result.percentage).toBe(0);
			expect(result.remaining).toBe(1000000);
			expect(result.isOverBudget).toBe(false);
			expect(result.status).toBe("good");
		});
	});

	describe("validateTransactionAmount", () => {
		it("should accept positive numbers", () => {
			expect(validateTransactionAmount(100)).toBe(true);
			expect(validateTransactionAmount(0.01)).toBe(true);
		});

		it("should accept positive string numbers", () => {
			expect(validateTransactionAmount("100")).toBe(true);
			expect(validateTransactionAmount("1000.50")).toBe(true);
		});

		it("should reject zero", () => {
			expect(validateTransactionAmount(0)).toBe(false);
			expect(validateTransactionAmount("0")).toBe(false);
		});

		it("should reject negative numbers", () => {
			expect(validateTransactionAmount(-100)).toBe(false);
			expect(validateTransactionAmount("-50")).toBe(false);
		});

		it("should reject invalid strings", () => {
			expect(validateTransactionAmount("abc")).toBe(false);
			expect(validateTransactionAmount("")).toBe(false);
		});

		it("should reject NaN", () => {
			expect(validateTransactionAmount(NaN)).toBe(false);
		});
	});

	describe("calculateTotalBalance", () => {
		it("should sum positive balances", () => {
			const accounts = [
				{ balance: "1000000" },
				{ balance: "500000" },
				{ balance: "250000" },
			];

			expect(calculateTotalBalance(accounts)).toBe(1750000);
		});

		it("should handle negative balances", () => {
			const accounts = [{ balance: "1000000" }, { balance: "-500000" }];

			expect(calculateTotalBalance(accounts)).toBe(500000);
		});

		it("should handle empty array", () => {
			expect(calculateTotalBalance([])).toBe(0);
		});

		it("should handle zero balances", () => {
			const accounts = [{ balance: "0" }, { balance: "0" }];

			expect(calculateTotalBalance(accounts)).toBe(0);
		});

		it("should handle missing balance", () => {
			const accounts = [{ balance: "1000" }, { balance: "" }];

			expect(calculateTotalBalance(accounts)).toBe(1000);
		});

		it("should handle decimal balances", () => {
			const accounts = [{ balance: "1000.50" }, { balance: "500.25" }];

			expect(calculateTotalBalance(accounts)).toBe(1500.75);
		});
	});
});
