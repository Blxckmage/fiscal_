import { z } from "zod";
import { eq } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { publicProcedure } from "../init";

export const accountsRouter = {
	getAll: publicProcedure.query(async () => {
		return await db.select().from(accounts);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const [account] = await db
				.select()
				.from(accounts)
				.where(eq(accounts.id, input.id));
			return account;
		}),

	create: publicProcedure
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
		.mutation(async ({ input }) => {
			const [account] = await db
				.insert(accounts)
				.values({
					// userId will be added when auth is implemented
					userId: "temp-user-id", // TODO: Replace with actual user ID from context
					...input,
				})
				.returning();
			return account;
		}),

	update: publicProcedure
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
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			const [account] = await db
				.update(accounts)
				.set({
					...data,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(accounts.id, id))
				.returning();
			return account;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await db.delete(accounts).where(eq(accounts.id, input.id));
			return { success: true };
		}),

	getTotalBalance: publicProcedure.query(async () => {
		const allAccounts = await db
			.select()
			.from(accounts)
			.where(eq(accounts.isActive, true));

		const total = allAccounts.reduce((sum, account) => {
			return sum + Number.parseFloat(account.balance);
		}, 0);

		return { total: total.toString() };
	}),
} satisfies TRPCRouterRecord;
