import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";

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

	return (
		<div className="min-h-screen p-8 bg-white dark:bg-black">
			<div className="container mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold uppercase mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session?.user?.name || session?.user?.email}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Total Balance Card */}
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 text-muted-foreground">
							Total Balance
						</h2>
						{loadingBalance ? (
							<p className="text-3xl font-bold">...</p>
						) : (
							<p className="text-3xl font-bold">
								IDR{" "}
								{Number.parseFloat(totalBalance?.total || "0").toLocaleString()}
							</p>
						)}
					</div>

					{/* Placeholder cards */}
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 text-muted-foreground">
							This Month
						</h2>
						<p className="text-3xl font-bold">Coming Soon</p>
					</div>

					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
						<h2 className="text-sm font-bold uppercase mb-2 text-muted-foreground">
							Budgets
						</h2>
						<p className="text-3xl font-bold">Coming Soon</p>
					</div>
				</div>

				{/* Recent Transactions */}
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
					<h2 className="text-xl font-bold uppercase mb-4">
						Recent Transactions
					</h2>
					{loadingTransactions ? (
						<p>Loading...</p>
					) : recentTransactions && recentTransactions.length > 0 ? (
						<div className="space-y-2">
							{recentTransactions.map((transaction) => (
								<div
									key={transaction.id}
									className="border-2 border-black dark:border-white p-4 flex justify-between items-center"
								>
									<div>
										<p className="font-bold">
											{transaction.description || "Transaction"}
										</p>
										<p className="text-sm text-muted-foreground">
											{new Date(transaction.date).toLocaleDateString()}
										</p>
									</div>
									<p
										className={`text-xl font-bold ${
											transaction.type === "income"
												? "text-accent"
												: "text-destructive"
										}`}
									>
										{transaction.type === "income" ? "+" : "-"} IDR{" "}
										{Number.parseFloat(transaction.amount).toLocaleString()}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground">No transactions yet</p>
					)}
				</div>
			</div>
		</div>
	);
}
