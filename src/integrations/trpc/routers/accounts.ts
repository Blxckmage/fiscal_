import { z } from "zod";
import { eq, and } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { protectedProcedure } from "../init";

export const accountsRouter = {
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(accounts)
			.where(eq(accounts.userId, ctx.userId));
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [account] = await db
				.select()
				.from(accounts)
				.where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.userId)));
			return account;
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.enum(["bank", "cash", "e-wallet", "credit-card"]),
				balance: z.string().default("0"),
				currency: z.string().default("IDR"),
				color: z.string().optional(),
				icon: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [account] = await db
				.insert(accounts)
				.values({
					userId: ctx.userId,
					...input,
				})
				.returning();
			return account;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				type: z.enum(["bank", "cash", "e-wallet", "credit-card"]).optional(),
				color: z.string().optional(),
				icon: z.string().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const [account] = await db
				.update(accounts)
				.set({
					...data,
					updatedAt: new Date().toISOString(),
				})
				.where(and(eq(accounts.id, id), eq(accounts.userId, ctx.userId)))
				.returning();
			return account;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await db
				.delete(accounts)
				.where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.userId)));
			return { success: true };
		}),

	getTotalBalance: protectedProcedure.query(async ({ ctx }) => {
		const allAccounts = await db
			.select()
			.from(accounts)
			.where(and(eq(accounts.isActive, true), eq(accounts.userId, ctx.userId)));

		const total = allAccounts.reduce((sum, account) => {
			return sum + Number.parseFloat(account.balance);
		}, 0);

		return { total: total.toString() };
	}),
} satisfies TRPCRouterRecord;
