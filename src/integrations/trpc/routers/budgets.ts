import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { publicProcedure } from "../init";

export const budgetsRouter = {
	getAll: publicProcedure.query(async () => {
		return await db.select().from(budgets).where(eq(budgets.isActive, true));
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const [budget] = await db
				.select()
				.from(budgets)
				.where(eq(budgets.id, input.id));
			return budget;
		}),

	create: publicProcedure
		.input(
			z.object({
				categoryId: z.string(),
				amount: z.string(),
				period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
				startDate: z.string(),
				endDate: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const [budget] = await db
				.insert(budgets)
				.values({
					userId: "temp-user-id", // TODO: Replace with actual user ID
					...input,
				})
				.returning();
			return budget;
		}),

	update: publicProcedure
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
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			const [budget] = await db
				.update(budgets)
				.set({
					...data,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(budgets.id, id))
				.returning();
			return budget;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await db.delete(budgets).where(eq(budgets.id, input.id));
			return { success: true };
		}),

	getProgress: publicProcedure
		.input(z.object({ budgetId: z.string() }))
		.query(async ({ input }) => {
			const [budget] = await db
				.select()
				.from(budgets)
				.where(eq(budgets.id, input.budgetId));

			if (!budget) {
				throw new Error("Budget not found");
			}

			// Calculate spent amount
			const spentTransactions = await db
				.select()
				.from(transactions)
				.where(
					and(
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
