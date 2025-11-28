import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/transactions/")({
	component: () => (
		<ProtectedRoute>
			<TransactionsPage />
		</ProtectedRoute>
	),
});

function TransactionsPage() {
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		type: "" as "" | "income" | "expense",
		accountId: "",
		categoryId: "",
		startDate: "",
		endDate: "",
	});

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: transactions = [] } = useQuery(
		trpc.transactions.getAll.queryOptions({
			type: filters.type || undefined,
			accountId: filters.accountId || undefined,
			categoryId: filters.categoryId || undefined,
			startDate: filters.startDate || undefined,
			endDate: filters.endDate || undefined,
		}),
	);
	const { data: accounts = [] } = useQuery(trpc.accounts.getAll.queryOptions());
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const updateMutation = useMutation({
		...trpc.transactions.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
	const deleteMutation = useMutation({
		...trpc.transactions.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});

	const editingTransaction = transactions.find((t: any) => t.id === editingId);

	const form = useForm({
		defaultValues: {
			accountId: editingTransaction?.accountId || "",
			categoryId: editingTransaction?.categoryId || "",
			amount: editingTransaction?.amount || "",
			description: editingTransaction?.description || "",
			date: editingTransaction?.date || "",
			notes: editingTransaction?.notes || "",
		},
		onSubmit: async ({ value }) => {
			if (!editingId) return;
			try {
				await updateMutation.mutateAsync({
					id: editingId,
					accountId: value.accountId,
					categoryId: value.categoryId,
					amount: value.amount,
					description: value.description || undefined,
					date: value.date,
					notes: value.notes || undefined,
				});
				toast.success("Transaction updated successfully!");
				resetForm();
			} catch (error) {
				toast.error("Failed to update transaction");
			}
		},
	});

	const resetForm = () => {
		setIsEditOpen(false);
		setEditingId(null);
		form.reset();
	};

	const handleEdit = (transaction: (typeof transactions)[0]) => {
		setEditingId(transaction.id);
		setIsEditOpen(true);
		// Update form values
		form.setFieldValue("accountId", transaction.accountId);
		form.setFieldValue("categoryId", transaction.categoryId);
		form.setFieldValue("amount", transaction.amount);
		form.setFieldValue("description", transaction.description || "");
		form.setFieldValue("date", transaction.date);
		form.setFieldValue("notes", transaction.notes || "");
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
			toast.success("Transaction deleted successfully!");
			setDeleteConfirm(null);
		} catch (error) {
			toast.error("Failed to delete transaction");
		}
	};

	const formatCurrency = (amount: string) => {
		const num = Number.parseFloat(amount);
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(num);
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getAccountName = (accountId: string) => {
		const account = accounts.find((a: any) => a.id === accountId);
		return account?.name || "Unknown";
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c: any) => c.id === categoryId);
		return category?.name || "Unknown";
	};

	const clearFilters = () => {
		setFilters({
			type: "",
			accountId: "",
			categoryId: "",
			startDate: "",
			endDate: "",
		});
	};

	const hasActiveFilters =
		filters.type ||
		filters.accountId ||
		filters.categoryId ||
		filters.startDate ||
		filters.endDate;

	// Filter and group categories based on selected type
	const filteredCategories = filters.type
		? categories.filter((cat: any) => cat.type === filters.type)
		: categories;

	// Group categories by type for better display
	const incomeCategories = categories.filter(
		(cat: any) => cat.type === "income",
	);
	const expenseCategories = categories.filter(
		(cat: any) => cat.type === "expense",
	);

	return (
		<div className="container mx-auto p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold uppercase">Transactions</h1>
				<Link to="/transactions/new">
					<Button className="border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white uppercase font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
						+ Add Transaction
					</Button>
				</Link>
			</div>

			{/* Filters */}
			<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold uppercase">Filters</h2>
					{hasActiveFilters && (
						<Button
							onClick={clearFilters}
							variant="outline"
							size="sm"
							className="border-2 border-black dark:border-white uppercase font-bold text-xs"
						>
							Clear All
						</Button>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					{/* Type Filter */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1">
							Type
						</label>
						<select
							value={filters.type}
							onChange={(e) =>
								setFilters({
									...filters,
									type: e.target.value as "" | "income" | "expense",
									categoryId: "", // Reset category when type changes
								})
							}
							className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-sm"
						>
							<option value="">All</option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>
					</div>

					{/* Account Filter */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1">
							Account
						</label>
						<select
							value={filters.accountId}
							onChange={(e) =>
								setFilters({ ...filters, accountId: e.target.value })
							}
							className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-sm"
						>
							<option value="">All Accounts</option>
							{accounts.map((account) => (
								<option key={account.id} value={account.id}>
									{account.name}
								</option>
							))}
						</select>
					</div>

					{/* Category Filter */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1">
							Category
						</label>
						<select
							value={filters.categoryId}
							onChange={(e) =>
								setFilters({ ...filters, categoryId: e.target.value })
							}
							className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-sm"
						>
							<option value="">All Categories</option>
							{filters.type ? (
								// Show filtered categories when a type is selected
								filteredCategories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))
							) : (
								// Show grouped categories when "All" is selected
								<>
									<optgroup label="INCOME CATEGORIES">
										{incomeCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</optgroup>
									<optgroup label="EXPENSE CATEGORIES">
										{expenseCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</optgroup>
								</>
							)}
						</select>
					</div>

					{/* Start Date Filter */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1">
							From Date
						</label>
						<input
							type="date"
							value={filters.startDate}
							onChange={(e) =>
								setFilters({ ...filters, startDate: e.target.value })
							}
							className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-sm"
						/>
					</div>

					{/* End Date Filter */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1">
							To Date
						</label>
						<input
							type="date"
							value={filters.endDate}
							onChange={(e) =>
								setFilters({ ...filters, endDate: e.target.value })
							}
							className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-sm"
						/>
					</div>
				</div>
			</div>

			{/* Transaction List */}
			{transactions.length === 0 ? (
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 text-center">
					<p className="text-xl uppercase font-bold mb-4">
						{hasActiveFilters
							? "No Matching Transactions"
							: "No Transactions Yet"}
					</p>
					<p className="mb-4">
						{hasActiveFilters
							? "Try adjusting your filters"
							: "Create your first transaction to start tracking"}
					</p>
					{hasActiveFilters ? (
						<Button
							onClick={clearFilters}
							variant="outline"
							className="border-2 border-black dark:border-white uppercase font-bold"
						>
							Clear Filters
						</Button>
					) : (
						<Link to="/transactions/new">
							<Button className="border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white">
								+ Add Transaction
							</Button>
						</Link>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{transactions.map((transaction) => (
						<div
							key={transaction.id}
							className="border-4 border-black dark:border-white bg-white dark:bg-black p-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
								{/* Date */}
								<div className="md:col-span-2">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Date
									</p>
									<p className="font-mono">{formatDate(transaction.date)}</p>
								</div>

								{/* Type Badge */}
								<div className="md:col-span-1">
									<span
										className={`inline-block px-2 py-1 text-xs uppercase font-bold border-2 ${
											transaction.type === "income"
												? "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
												: "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
										}`}
									>
										{transaction.type}
									</span>
								</div>

								{/* Description */}
								<div className="md:col-span-3">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Description
									</p>
									<p className="uppercase">
										{transaction.description || "No Description"}
									</p>
								</div>

								{/* Category */}
								<div className="md:col-span-2">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Category
									</p>
									<p className="uppercase">
										{getCategoryName(transaction.categoryId)}
									</p>
								</div>

								{/* Account */}
								<div className="md:col-span-2">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Account
									</p>
									<p className="uppercase">
										{getAccountName(transaction.accountId)}
									</p>
								</div>

								{/* Amount */}
								<div className="md:col-span-2 md:text-right">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Amount
									</p>
									<p
										className={`font-bold text-lg ${
											transaction.type === "income"
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										{transaction.type === "income" ? "+" : "-"}
										{formatCurrency(transaction.amount)}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="mt-4 pt-4 border-t-2 border-black dark:border-white">
								{deleteConfirm === transaction.id ? (
									<div className="flex items-center gap-2">
										<p className="text-sm font-bold uppercase flex-1">
											Confirm Delete?
										</p>
										<Button
											onClick={() => handleDelete(transaction.id)}
											variant="destructive"
											size="sm"
											className="uppercase font-bold border-2 border-black dark:border-white"
										>
											Yes, Delete
										</Button>
										<Button
											onClick={() => setDeleteConfirm(null)}
											variant="outline"
											size="sm"
											className="uppercase font-bold border-2 border-black dark:border-white"
										>
											Cancel
										</Button>
									</div>
								) : (
									<div className="flex gap-2">
										<Button
											onClick={() => handleEdit(transaction)}
											variant="outline"
											size="sm"
											className="uppercase font-bold border-2 border-black dark:border-white"
										>
											Edit
										</Button>
										<Button
											onClick={() => setDeleteConfirm(transaction.id)}
											variant="outline"
											size="sm"
											className="uppercase font-bold border-2 border-black dark:border-white"
										>
											Delete
										</Button>
									</div>
								)}
							</div>

							{/* Notes (if any) */}
							{transaction.notes && (
								<div className="mt-2 p-2 border-2 border-black dark:border-white">
									<p className="text-xs uppercase font-bold opacity-70 mb-1">
										Notes
									</p>
									<p className="text-sm">{transaction.notes}</p>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Edit Form Modal */}
			{isEditOpen && editingTransaction && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h2 className="text-2xl font-bold uppercase mb-6">
							Edit Transaction
						</h2>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							{/* Account Selection */}
							<form.Field
								name="accountId"
								validators={{
									onChange: ({ value }) =>
										!value ? "Please select an account" : undefined,
								}}
							>
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Account *
										</label>
										<select
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="">Select Account</option>
											{accounts.map((account) => (
												<option key={account.id} value={account.id}>
													{account.name} - {account.type}
												</option>
											))}
										</select>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Category Selection */}
							<form.Field
								name="categoryId"
								validators={{
									onChange: ({ value }) =>
										!value ? "Please select a category" : undefined,
								}}
							>
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Category *
										</label>
										<select
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="">Select Category</option>
											{categories
												.filter(
													(cat: any) => cat.type === editingTransaction.type,
												)
												.map((category) => (
													<option key={category.id} value={category.id}>
														{category.name}
													</option>
												))}
										</select>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Amount */}
							<form.Field
								name="amount"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "Amount is required";
										if (Number.parseFloat(value) <= 0)
											return "Amount must be greater than 0";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Amount *
										</label>
										<input
											type="number"
											step="0.01"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono text-2xl"
											placeholder="0.00"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Description */}
							<form.Field name="description">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Description
										</label>
										<input
											type="text"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
											placeholder="COFFEE AT STARBUCKS"
										/>
									</div>
								)}
							</form.Field>

							{/* Date */}
							<form.Field
								name="date"
								validators={{
									onChange: ({ value }) =>
										!value ? "Date is required" : undefined,
								}}
							>
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Date *
										</label>
										<input
											type="date"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Notes */}
							<form.Field name="notes">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Notes
										</label>
										<textarea
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											rows={3}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black font-mono"
											placeholder="Additional notes..."
										/>
									</div>
								)}
							</form.Field>

							{/* Form Actions */}
							<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={!form.state.canSubmit}
									className="flex-1 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
								>
									Update
								</Button>
								<Button
									type="button"
									onClick={resetForm}
									variant="outline"
									className="flex-1 border-2 border-black dark:border-white uppercase font-bold"
								>
									Cancel
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
