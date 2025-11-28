import { z } from "zod";
import { eq, or } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { publicProcedure } from "../init";

export const categoriesRouter = {
	getAll: publicProcedure.query(async () => {
		// Get all system categories and user's custom categories
		return await db
			.select()
			.from(categories)
			.where(
				or(
					eq(categories.isSystem, true),
					// TODO: Add user-specific filter when auth is implemented
					// eq(categories.userId, ctx.userId)
				),
			);
	}),

	getByType: publicProcedure
		.input(z.object({ type: z.enum(["income", "expense"]) }))
		.query(async ({ input }) => {
			return await db.select().from(categories).where(
				eq(categories.type, input.type),
				// TODO: Add user filter
			);
		}),

	create: publicProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.enum(["income", "expense"]),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const [category] = await db
				.insert(categories)
				.values({
					// userId will be added when auth is implemented
					userId: "temp-user-id", // TODO: Replace with actual user ID
					...input,
					isSystem: false,
				})
				.returning();
			return category;
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Check if it's a system category (cannot be edited)
			const [existing] = await db
				.select()
				.from(categories)
				.where(eq(categories.id, id));

			if (!existing || existing.isSystem) {
				throw new Error("Cannot update system categories");
			}

			const [category] = await db
				.update(categories)
				.set(data)
				.where(eq(categories.id, id))
				.returning();
			return category;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			// Check if it's a system category (cannot be deleted)
			const [existing] = await db
				.select()
				.from(categories)
				.where(eq(categories.id, input.id));

			if (!existing || existing.isSystem) {
				throw new Error("Cannot delete system categories");
			}

			await db.delete(categories).where(eq(categories.id, input.id));
			return { success: true };
		}),
} satisfies TRPCRouterRecord;
