import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
	it("should merge class names correctly", () => {
		const result = cn("px-4", "py-2", "bg-blue-500");
		expect(result).toBe("px-4 py-2 bg-blue-500");
	});

	it("should handle conditional classes", () => {
		const isActive = true;
		const result = cn("base-class", isActive && "active-class");
		expect(result).toBe("base-class active-class");
	});

	it("should merge conflicting tailwind classes", () => {
		const result = cn("px-4 px-8");
		// twMerge should keep only the last px value
		expect(result).toBe("px-8");
	});

	it("should handle undefined and null values", () => {
		const result = cn("base-class", undefined, null, "another-class");
		expect(result).toBe("base-class another-class");
	});

	it("should handle empty input", () => {
		const result = cn();
		expect(result).toBe("");
	});
});
