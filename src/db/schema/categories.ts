import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const categories = sqliteTable("categories", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Nullable for system categories
	name: text("name").notNull(),
	type: text("type", { enum: ["income", "expense"] }).notNull(),
	icon: text("icon"),
	color: text("color"),
	isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
