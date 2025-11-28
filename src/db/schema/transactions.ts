import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { users } from "./users";

export const transactions = sqliteTable("transactions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accountId: text("account_id")
		.notNull()
		.references(() => accounts.id, { onDelete: "cascade" }),
	categoryId: text("category_id")
		.notNull()
		.references(() => categories.id, { onDelete: "restrict" }),
	type: text("type", { enum: ["income", "expense"] }).notNull(),
	amount: text("amount").notNull(), // Store as string to maintain precision
	description: text("description"),
	date: text("date").notNull(), // ISO date string
	notes: text("notes"),
	createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
