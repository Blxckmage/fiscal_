import { z } from "zod";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { transactions, accounts } from "@/db/schema";
import { protectedProcedure } from "../init";

export const transactionsRouter = {
	getAll: protectedProcedure
		.input(
			z.object({
				accountId: z.string().optional(),
				categoryId: z.string().optional(),
				type: z.enum(["income", "expense"]).optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input, ctx }) => {
			const conditions = [eq(transactions.userId, ctx.userId)];

			if (input.accountId) {
				conditions.push(eq(transactions.accountId, input.accountId));
			}
			if (input.categoryId) {
				conditions.push(eq(transactions.categoryId, input.categoryId));
			}
			if (input.type) {
				conditions.push(eq(transactions.type, input.type));
			}
			if (input.startDate) {
				conditions.push(gte(transactions.date, input.startDate));
			}
			if (input.endDate) {
				conditions.push(lte(transactions.date, input.endDate));
			}

			return await db
				.select()
				.from(transactions)
				.where(and(...conditions))
				.orderBy(desc(transactions.date))
				.limit(input.limit)
				.offset(input.offset);
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [transaction] = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.id, input.id),
						eq(transactions.userId, ctx.userId),
					),
				);
			return transaction;
		}),

	create: protectedProcedure
		.input(
			z.object({
				accountId: z.string(),
				categoryId: z.string(),
				type: z.enum(["income", "expense"]),
				amount: z.string(),
				description: z.string().optional(),
				date: z.string(),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Verify account belongs to user
			const [account] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.id, input.accountId),
						eq(accounts.userId, ctx.userId),
					),
				);

			if (!account) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Account not found",
				});
			}

			// Create transaction
			const [transaction] = await db
				.insert(transactions)
				.values({
					userId: ctx.userId,
					...input,
				})
				.returning();

			// Update account balance
			const currentBalance = Number.parseFloat(account.balance);
			const amount = Number.parseFloat(input.amount);
			const newBalance =
				input.type === "income"
					? currentBalance + amount
					: currentBalance - amount;

			await db
				.update(accounts)
				.set({
					balance: newBalance.toString(),
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(accounts.id, input.accountId),
						eq(accounts.userId, ctx.userId),
					),
				);

			return transaction;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				accountId: z.string().optional(),
				categoryId: z.string().optional(),
				amount: z.string().optional(),
				description: z.string().optional(),
				date: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			// Get old transaction to recalculate balance
			const [oldTransaction] = await db
				.select()
				.from(transactions)
				.where(
					and(eq(transactions.id, id), eq(transactions.userId, ctx.userId)),
				);

			if (!oldTransaction) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transaction not found",
				});
			}

			// Revert old balance change
			const [oldAccount] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.id, oldTransaction.accountId),
						eq(accounts.userId, ctx.userId),
					),
				);

			if (oldAccount) {
				const currentBalance = Number.parseFloat(oldAccount.balance);
				const oldAmount = Number.parseFloat(oldTransaction.amount);
				const revertedBalance =
					oldTransaction.type === "income"
						? currentBalance - oldAmount
						: currentBalance + oldAmount;

				await db
					.update(accounts)
					.set({ balance: revertedBalance.toString() })
					.where(
						and(
							eq(accounts.id, oldTransaction.accountId),
							eq(accounts.userId, ctx.userId),
						),
					);
			}

			// Update transaction
			const [transaction] = await db
				.update(transactions)
				.set({
					...data,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(eq(transactions.id, id), eq(transactions.userId, ctx.userId)),
				)
				.returning();

			// Apply new balance change
			const newAccountId = data.accountId || oldTransaction.accountId;
			const [newAccount] = await db
				.select()
				.from(accounts)
				.where(
					and(eq(accounts.id, newAccountId), eq(accounts.userId, ctx.userId)),
				);

			if (newAccount) {
				const currentBalance = Number.parseFloat(newAccount.balance);
				const newAmount = Number.parseFloat(
					data.amount || oldTransaction.amount,
				);
				const updatedBalance =
					oldTransaction.type === "income"
						? currentBalance + newAmount
						: currentBalance - newAmount;

				await db
					.update(accounts)
					.set({
						balance: updatedBalance.toString(),
						updatedAt: new Date().toISOString(),
					})
					.where(
						and(eq(accounts.id, newAccountId), eq(accounts.userId, ctx.userId)),
					);
			}

			return transaction;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			// Get transaction to adjust balance
			const [transaction] = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.id, input.id),
						eq(transactions.userId, ctx.userId),
					),
				);

			if (!transaction) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transaction not found",
				});
			}

			// Adjust account balance
			const [account] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.id, transaction.accountId),
						eq(accounts.userId, ctx.userId),
					),
				);

			if (account) {
				const currentBalance = Number.parseFloat(account.balance);
				const amount = Number.parseFloat(transaction.amount);
				const newBalance =
					transaction.type === "income"
						? currentBalance - amount
						: currentBalance + amount;

				await db
					.update(accounts)
					.set({
						balance: newBalance.toString(),
						updatedAt: new Date().toISOString(),
					})
					.where(
						and(
							eq(accounts.id, transaction.accountId),
							eq(accounts.userId, ctx.userId),
						),
					);
			}

			// Delete transaction
			await db
				.delete(transactions)
				.where(
					and(
						eq(transactions.id, input.id),
						eq(transactions.userId, ctx.userId),
					),
				);
			return { success: true };
		}),

	getRecent: protectedProcedure
		.input(z.object({ limit: z.number().default(10) }))
		.query(async ({ input, ctx }) => {
			return await db
				.select()
				.from(transactions)
				.where(eq(transactions.userId, ctx.userId))
				.orderBy(desc(transactions.date))
				.limit(input.limit);
		}),

	getByDateRange: protectedProcedure
		.input(
			z.object({
				startDate: z.string(),
				endDate: z.string(),
				accountId: z.string().optional(),
				categoryId: z.string().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const conditions = [
				eq(transactions.userId, ctx.userId),
				gte(transactions.date, input.startDate),
				lte(transactions.date, input.endDate),
			];

			if (input.accountId) {
				conditions.push(eq(transactions.accountId, input.accountId));
			}
			if (input.categoryId) {
				conditions.push(eq(transactions.categoryId, input.categoryId));
			}

			return await db
				.select()
				.from(transactions)
				.where(and(...conditions))
				.orderBy(desc(transactions.date));
		}),
} satisfies TRPCRouterRecord;
