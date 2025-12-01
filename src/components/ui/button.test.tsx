import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
	it("should render button with text", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
	});

	it("should apply default variant styles", () => {
		render(<Button>Default Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-primary");
	});

	it("should apply destructive variant", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-destructive");
	});

	it("should apply outline variant", () => {
		render(<Button variant="outline">Outline</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("border");
	});

	it("should apply different sizes", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		let button = screen.getByRole("button");
		expect(button.className).toContain("h-8");

		rerender(<Button size="lg">Large</Button>);
		button = screen.getByRole("button");
		expect(button.className).toContain("h-10");
	});

	it("should handle disabled state", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveProperty("disabled", true);
		expect(button.className).toContain("disabled:opacity-50");
	});

	it("should merge custom className", () => {
		render(<Button className="custom-class">Custom</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("custom-class");
	});

	it("should handle click events", () => {
		let clicked = false;
		render(
			<Button
				onClick={() => {
					clicked = true;
				}}
			>
				Click me
			</Button>,
		);
		const button = screen.getByRole("button");
		button.click();
		expect(clicked).toBe(true);
	});
});
