import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { protectedProcedure } from "../init";

export const budgetsRouter = {
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(budgets)
			.where(and(eq(budgets.isActive, true), eq(budgets.userId, ctx.userId)));
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [budget] = await db
				.select()
				.from(budgets)
				.where(and(eq(budgets.id, input.id), eq(budgets.userId, ctx.userId)));
			return budget;
		}),

	create: protectedProcedure
		.input(
			z.object({
				categoryId: z.string(),
				amount: z.string(),
				period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
				startDate: z.string(),
				endDate: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [budget] = await db
				.insert(budgets)
				.values({
					userId: ctx.userId,
					...input,
				})
				.returning();
			return budget;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				amount: z.string().optional(),
				period: z.enum(["monthly", "weekly", "yearly"]).optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const [budget] = await db
				.update(budgets)
				.set({
					...data,
					updatedAt: new Date().toISOString(),
				})
				.where(and(eq(budgets.id, id), eq(budgets.userId, ctx.userId)))
				.returning();
			return budget;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await db
				.delete(budgets)
				.where(and(eq(budgets.id, input.id), eq(budgets.userId, ctx.userId)));
			return { success: true };
		}),

	getProgress: protectedProcedure
		.input(z.object({ budgetId: z.string() }))
		.query(async ({ input, ctx }) => {
			const [budget] = await db
				.select()
				.from(budgets)
				.where(
					and(eq(budgets.id, input.budgetId), eq(budgets.userId, ctx.userId)),
				);

			if (!budget) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Budget not found",
				});
			}

			// Calculate spent amount
			const spentTransactions = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.userId, ctx.userId),
						eq(transactions.categoryId, budget.categoryId),
						eq(transactions.type, "expense"),
						gte(transactions.date, budget.startDate),
						lte(transactions.date, budget.endDate),
					),
				);

			const spent = spentTransactions.reduce((sum, t) => {
				return sum + Number.parseFloat(t.amount);
			}, 0);

			const budgetAmount = Number.parseFloat(budget.amount);
			const remaining = budgetAmount - spent;
			const percentage = (spent / budgetAmount) * 100;

			return {
				budget,
				spent: spent.toString(),
				remaining: remaining.toString(),
				percentage: percentage.toFixed(2),
				isOverBudget: spent > budgetAmount,
			};
		}),
} satisfies TRPCRouterRecord;
