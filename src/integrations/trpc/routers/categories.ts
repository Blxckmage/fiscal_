import { z } from "zod";
import { eq, or, and } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { protectedProcedure } from "../init";

export const categoriesRouter = {
	getAll: protectedProcedure.query(async ({ ctx }) => {
		// Get all system categories and user's custom categories
		return await db
			.select()
			.from(categories)
			.where(
				or(eq(categories.isSystem, true), eq(categories.userId, ctx.userId)),
			);
	}),

	getByType: protectedProcedure
		.input(z.object({ type: z.enum(["income", "expense"]) }))
		.query(async ({ input, ctx }) => {
			return await db
				.select()
				.from(categories)
				.where(
					and(
						eq(categories.type, input.type),
						or(
							eq(categories.isSystem, true),
							eq(categories.userId, ctx.userId),
						),
					),
				);
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.enum(["income", "expense"]),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [category] = await db
				.insert(categories)
				.values({
					userId: ctx.userId,
					...input,
					isSystem: false,
				})
				.returning();
			return category;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			// Check if it's a system category (cannot be edited)
			const [existing] = await db
				.select()
				.from(categories)
				.where(and(eq(categories.id, id), eq(categories.userId, ctx.userId)));

			if (!existing || existing.isSystem) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot update system categories",
				});
			}

			const [category] = await db
				.update(categories)
				.set(data)
				.where(and(eq(categories.id, id), eq(categories.userId, ctx.userId)))
				.returning();
			return category;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			// Check if it's a system category (cannot be deleted)
			const [existing] = await db
				.select()
				.from(categories)
				.where(
					and(eq(categories.id, input.id), eq(categories.userId, ctx.userId)),
				);

			if (!existing || existing.isSystem) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot delete system categories",
				});
			}

			await db
				.delete(categories)
				.where(
					and(eq(categories.id, input.id), eq(categories.userId, ctx.userId)),
				);
			return { success: true };
		}),
} satisfies TRPCRouterRecord;
