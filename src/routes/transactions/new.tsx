import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState } from "react";

export const Route = createFileRoute("/transactions/new")({
	component: () => (
		<ProtectedRoute>
			<NewTransactionPage />
		</ProtectedRoute>
	),
});

function NewTransactionPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { data: accounts = [] } = useQuery(trpc.accounts.getAll.queryOptions());
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);
	const createMutation = useMutation(
		trpc.transactions.create.mutationOptions(),
	);

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0];

	// Use state to track transaction type for proper reactivity
	const [transactionType, setTransactionType] = useState<"income" | "expense">(
		"expense",
	);

	const form = useForm({
		defaultValues: {
			type: "expense",
			accountId: "",
			categoryId: "",
			amount: "",
			description: "",
			date: today,
			notes: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync({
					type: value.type as "income" | "expense",
					accountId: value.accountId,
					categoryId: value.categoryId,
					amount: value.amount,
					description: value.description || undefined,
					date: value.date,
					notes: value.notes || undefined,
				});
				toast.success("Transaction created successfully!");
				navigate({ to: "/transactions" });
			} catch (error) {
				toast.error("Failed to create transaction");
			}
		},
	});

	// Filter categories based on transaction type
	const filteredCategories = categories.filter(
		(cat: any) => cat.type === transactionType,
	);

	// Reset categoryId when type changes if category doesn't match
	const handleTypeChange = (type: "income" | "expense") => {
		setTransactionType(type);
		form.setFieldValue("type", type);
		const currentCategoryId = form.getFieldValue("categoryId");
		const currentCategory = categories.find(
			(cat: any) => cat.id === currentCategoryId,
		);
		if (currentCategory && (currentCategory as any).type !== type) {
			form.setFieldValue("categoryId", "");
		}
	};

	const activeAccounts = accounts.filter((acc: any) => acc.isActive);

	return (
		<div className="container mx-auto p-8 max-w-2xl">
			<div className="mb-8">
				<h1 className="text-4xl font-bold uppercase mb-2">New Transaction</h1>
				<p className="uppercase text-sm opacity-70">
					Record a new income or expense
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 space-y-6"
			>
				{/* Transaction Type */}
				<form.Field name="type">
					{(field) => (
						<div>
							<label className="block text-sm font-bold uppercase mb-2">
								Transaction Type *
							</label>
							<div className="grid grid-cols-2 gap-4">
								<button
									type="button"
									onClick={() => handleTypeChange("income")}
									className={`p-4 border-4 font-bold uppercase ${
										transactionType === "income"
											? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
											: "border-black dark:border-white bg-white dark:bg-black"
									}`}
								>
									Income
								</button>
								<button
									type="button"
									onClick={() => handleTypeChange("expense")}
									className={`p-4 border-4 font-bold uppercase ${
										transactionType === "expense"
											? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
											: "border-black dark:border-white bg-white dark:bg-black"
									}`}
								>
									Expense
								</button>
							</div>
						</div>
					)}
				</form.Field>

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
							{activeAccounts.length === 0 ? (
								<p className="text-sm text-red-600 dark:text-red-400 font-bold uppercase">
									No active accounts. Please create an account first.
								</p>
							) : (
								<>
									<select
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
									>
										<option value="">Select Account</option>
										{activeAccounts.map((account) => (
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
								</>
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
								{filteredCategories.map((category) => (
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
						onChange: ({ value }) => (!value ? "Date is required" : undefined),
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
				<div className="flex gap-4 pt-4">
					<Button
						type="submit"
						disabled={!form.state.canSubmit || activeAccounts.length === 0}
						className="flex-1 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
					>
						Create Transaction
					</Button>
					<Button
						type="button"
						onClick={() => navigate({ to: "/" })}
						variant="outline"
						className="flex-1 border-2 border-black dark:border-white uppercase font-bold"
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
