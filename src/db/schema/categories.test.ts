import { describe, it, expect } from "vitest";
import type { NewCategory } from "./categories";

describe("Category Schema", () => {
	it("should have correct type for income category", () => {
		const category: NewCategory = {
			name: "Salary",
			type: "income",
			userId: "user-123",
		};

		expect(category.type).toBe("income");
		expect(category.name).toBe("Salary");
	});

	it("should have correct type for expense category", () => {
		const category: NewCategory = {
			name: "Groceries",
			type: "expense",
			userId: "user-123",
		};

		expect(category.type).toBe("expense");
		expect(category.name).toBe("Groceries");
	});

	it("should allow system categories without userId", () => {
		const category: NewCategory = {
			name: "System Category",
			type: "expense",
			isSystem: true,
		};

		expect(category.isSystem).toBe(true);
		expect(category.userId).toBeUndefined();
	});

	it("should allow optional icon and color", () => {
		const category: NewCategory = {
			name: "Entertainment",
			type: "expense",
			userId: "user-123",
			icon: "🎮",
			color: "#FF5733",
		};

		expect(category.icon).toBe("🎮");
		expect(category.color).toBe("#FF5733");
	});
});
