import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	return (
		<ProtectedRoute>
			<DashboardContent />
		</ProtectedRoute>
	);
}

function DashboardContent() {
	const { data: session } = useSession();
	const trpc = useTRPC();
	const { data: totalBalance, isLoading: loadingBalance } = useQuery(
		trpc.accounts.getTotalBalance.queryOptions(),
	);
	const { data: recentTransactions, isLoading: loadingTransactions } = useQuery(
		trpc.transactions.getRecent.queryOptions({ limit: 5 }),
	);

	// Get current month date range
	const currentMonthRange = useMemo(() => {
		const now = new Date();
		const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
			.toISOString()
			.split("T")[0];
		const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			.toISOString()
			.split("T")[0];
		return { startDate, endDate };
	}, []);

	const { data: monthlyTransactions = [], isLoading: loadingMonthly } =
		useQuery(
			trpc.transactions.getByDateRange.queryOptions({
				startDate: currentMonthRange.startDate,
				endDate: currentMonthRange.endDate,
			}),
		);

	// Calculate monthly income and expense totals
	const monthlyTotals = useMemo(() => {
		const income = monthlyTransactions
			.filter((t: any) => t.type === "income")
			.reduce((sum, t: any) => sum + Number.parseFloat(t.amount), 0);
		const expense = monthlyTransactions
			.filter((t: any) => t.type === "expense")
			.reduce((sum, t: any) => sum + Number.parseFloat(t.amount), 0);
		return { income, expense, net: income - expense };
	}, [monthlyTransactions]);

	// Get accounts and categories for displaying transaction details
	const { data: accounts = [] } = useQuery(trpc.accounts.getAll.queryOptions());
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const getAccountName = (accountId: string) => {
		const account = accounts.find((a: any) => a.id === accountId);
		return account?.name || "Unknown";
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c: any) => c.id === categoryId);
		return category?.name || "Unknown";
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="min-h-screen p-8">
			<div className="container mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold uppercase mb-2">Dashboard</h1>
					<p className="uppercase text-sm opacity-70">
						Welcome back, {session?.user?.name || session?.user?.email}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Total Balance Card */}
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 opacity-70">
							Total Balance
						</h2>
						{loadingBalance ? (
							<p className="text-3xl font-bold">...</p>
						) : (
							<p className="text-3xl font-bold">
								{formatCurrency(Number.parseFloat(totalBalance?.total || "0"))}
							</p>
						)}
					</div>

					{/* Monthly Income Card */}
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 opacity-70">
							This Month Income
						</h2>
						{loadingMonthly ? (
							<p className="text-3xl font-bold">...</p>
						) : (
							<p className="text-3xl font-bold text-green-600 dark:text-green-400">
								+{formatCurrency(monthlyTotals.income)}
							</p>
						)}
					</div>

					{/* Monthly Expense Card */}
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 opacity-70">
							This Month Expense
						</h2>
						{loadingMonthly ? (
							<p className="text-3xl font-bold">...</p>
						) : (
							<p className="text-3xl font-bold text-red-600 dark:text-red-400">
								-{formatCurrency(monthlyTotals.expense)}
							</p>
						)}
					</div>
				</div>

				{/* Monthly Net */}
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6 mb-8">
					<h2 className="text-sm font-bold uppercase mb-2 opacity-70">
						This Month Net
					</h2>
					{loadingMonthly ? (
						<p className="text-4xl font-bold">...</p>
					) : (
						<p
							className={`text-4xl font-bold ${
								monthlyTotals.net >= 0
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400"
							}`}
						>
							{monthlyTotals.net >= 0 ? "+" : ""}
							{formatCurrency(monthlyTotals.net)}
						</p>
					)}
				</div>

				{/* Recent Transactions */}
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold uppercase">Recent Transactions</h2>
						<Link
							to="/transactions"
							className="text-sm font-bold uppercase hover:underline"
						>
							View All →
						</Link>
					</div>
					{loadingTransactions ? (
						<p className="uppercase text-sm opacity-70">Loading...</p>
					) : recentTransactions && recentTransactions.length > 0 ? (
						<div className="space-y-2">
							{recentTransactions.map((transaction) => (
								<div
									key={transaction.id}
									className="border-2 border-black dark:border-white p-4"
								>
									<div className="flex justify-between items-start mb-2">
										<div className="flex-1">
											<p className="font-bold uppercase mb-1">
												{transaction.description || "No Description"}
											</p>
											<div className="flex gap-4 text-xs uppercase opacity-70">
												<span>{getCategoryName(transaction.categoryId)}</span>
												<span>•</span>
												<span>{getAccountName(transaction.accountId)}</span>
												<span>•</span>
												<span>
													{new Date(transaction.date).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)}
												</span>
											</div>
										</div>
										<p
											className={`text-xl font-bold ml-4 ${
												transaction.type === "income"
													? "text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400"
											}`}
										>
											{transaction.type === "income" ? "+" : "-"}
											{formatCurrency(Number.parseFloat(transaction.amount))}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-xl uppercase font-bold mb-4 opacity-70">
								No Transactions Yet
							</p>
							<p className="mb-4 opacity-70">Start tracking your finances</p>
							<Link to="/transactions/new">
								<button
									type="button"
									className="border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-6 py-2 uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
								>
									+ Add Transaction
								</button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
