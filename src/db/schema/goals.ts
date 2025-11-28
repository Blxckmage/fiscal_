import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const goals = sqliteTable("goals", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	targetAmount: text("target_amount").notNull(), // Store as string to maintain precision
	currentAmount: text("current_amount").notNull().default("0"),
	deadline: text("deadline"), // Optional
	icon: text("icon"),
	color: text("color"),
	isCompleted: integer("is_completed", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
