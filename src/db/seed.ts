import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("data/fiscal.db");
const db = drizzle(sqlite, { schema });

// System categories that all users can access
const systemCategories = [
	// Income categories
	{ name: "Salary", type: "income", icon: "💼", color: "#10b981" },
	{ name: "Freelance", type: "income", icon: "💻", color: "#3b82f6" },
	{ name: "Investment", type: "income", icon: "📈", color: "#8b5cf6" },
	{ name: "Gift", type: "income", icon: "🎁", color: "#ec4899" },
	{ name: "Other Income", type: "income", icon: "💰", color: "#6366f1" },

	// Expense categories
	{ name: "Food & Dining", type: "expense", icon: "🍔", color: "#ef4444" },
	{ name: "Transportation", type: "expense", icon: "🚗", color: "#f59e0b" },
	{ name: "Shopping", type: "expense", icon: "🛍️", color: "#ec4899" },
	{ name: "Entertainment", type: "expense", icon: "🎬", color: "#8b5cf6" },
	{ name: "Bills & Utilities", type: "expense", icon: "📄", color: "#14b8a6" },
	{ name: "Healthcare", type: "expense", icon: "⚕️", color: "#ef4444" },
	{ name: "Education", type: "expense", icon: "📚", color: "#3b82f6" },
	{ name: "Housing", type: "expense", icon: "🏠", color: "#f59e0b" },
	{ name: "Insurance", type: "expense", icon: "🛡️", color: "#6366f1" },
	{ name: "Other Expense", type: "expense", icon: "💸", color: "#64748b" },
];

async function seed() {
	console.log("🌱 Seeding database...");

	// Insert system categories
	for (const category of systemCategories) {
		await db.insert(schema.categories).values({
			id: crypto.randomUUID(),
			userId: null, // null userId means system category
			name: category.name,
			type: category.type as "income" | "expense",
			icon: category.icon,
			color: category.color,
			isSystem: true,
		});
	}

	console.log(`✅ Seeded ${systemCategories.length} system categories`);
	console.log("🎉 Database seeded successfully!");

	sqlite.close();
}

seed().catch((error) => {
	console.error("❌ Error seeding database:", error);
	process.exit(1);
});
