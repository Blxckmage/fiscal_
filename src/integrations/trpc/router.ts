import { createTRPCRouter } from "./init";
import { accountsRouter } from "./routers/accounts";
import { categoriesRouter } from "./routers/categories";
import { transactionsRouter } from "./routers/transactions";
import { budgetsRouter } from "./routers/budgets";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoriesRouter,
	transactions: transactionsRouter,
	budgets: budgetsRouter,
});

export type TRPCRouter = typeof trpcRouter;
