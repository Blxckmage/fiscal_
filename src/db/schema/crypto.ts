import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const cryptoHoldings = sqliteTable("crypto", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	symbol: text("symbol").notNull(),
	name: text("name").notNull(),
	quantity: text("quantity").notNull(), // Store as string to maintain precision
	purchasePrice: text("purchase_price").notNull(), // USD
	purchaseDate: text("purchase_date").notNull(),
	currentPrice: text("current_price"), // USD, updated via API
	lastUpdated: text("last_updated"),
	notes: text("notes"),
	createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Crypto = typeof cryptoHoldings.$inferSelect;
export type NewCrypto = typeof cryptoHoldings.$inferInsert;
