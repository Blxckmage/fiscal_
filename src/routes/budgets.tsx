import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/budgets")({
	component: () => (
		<ProtectedRoute>
			<BudgetsPage />
		</ProtectedRoute>
	),
});

function BudgetsPage() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: budgets = [] } = useQuery(trpc.budgets.getAll.queryOptions());
	const { data: categories = [] } = useQuery(
		trpc.categories.getAll.queryOptions(),
	);

	const createMutation = useMutation({
		...trpc.budgets.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets"] });
		},
	});
	const updateMutation = useMutation({
		...trpc.budgets.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets"] });
		},
	});
	const deleteMutation = useMutation({
		...trpc.budgets.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets"] });
		},
	});

	const editingBudget = budgets.find((b: any) => b.id === editingId);

	// Create form
	const createForm = useForm({
		defaultValues: {
			categoryId: "",
			amount: "",
			period: "monthly" as "monthly" | "weekly" | "yearly",
			startDate: new Date().toISOString().split("T")[0],
			endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
				.toISOString()
				.split("T")[0],
		},
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync(value);
				toast.success("Budget created successfully!");
				setIsCreateOpen(false);
				createForm.reset();
			} catch (error) {
				toast.error("Failed to create budget");
			}
		},
	});

	// Edit form
	const editForm = useForm({
		defaultValues: {
			amount: editingBudget?.amount || "",
			period:
				(editingBudget?.period as "monthly" | "weekly" | "yearly") || "monthly",
			startDate: editingBudget?.startDate || "",
			endDate: editingBudget?.endDate || "",
		},
		onSubmit: async ({ value }) => {
			if (!editingId) return;
			try {
				await updateMutation.mutateAsync({
					id: editingId,
					...value,
				});
				toast.success("Budget updated successfully!");
				resetEditForm();
			} catch (error) {
				toast.error("Failed to update budget");
			}
		},
	});

	const resetEditForm = () => {
		setIsEditOpen(false);
		setEditingId(null);
		editForm.reset();
	};

	const handleEdit = (budget: (typeof budgets)[0]) => {
		setEditingId(budget.id);
		setIsEditOpen(true);
		editForm.setFieldValue("amount", budget.amount);
		editForm.setFieldValue(
			"period",
			budget.period as "monthly" | "weekly" | "yearly",
		);
		editForm.setFieldValue("startDate", budget.startDate);
		editForm.setFieldValue("endDate", budget.endDate);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
			toast.success("Budget deleted successfully!");
			setDeleteConfirm(null);
		} catch (error) {
			toast.error("Failed to delete budget");
		}
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c: any) => c.id === categoryId);
		return category?.name || "Unknown";
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

	// Get expense categories only (budgets are for expenses)
	const expenseCategories = categories.filter(
		(cat: any) => cat.type === "expense",
	);

	return (
		<div className="container mx-auto p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold uppercase">Budgets</h1>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white uppercase font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
				>
					+ Add Budget
				</Button>
			</div>

			{/* Budget List */}
			{budgets.length === 0 ? (
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 text-center">
					<p className="text-xl uppercase font-bold mb-4">No Budgets Yet</p>
					<p className="mb-4">
						Create your first budget to start tracking spending limits
					</p>
					<Button
						onClick={() => setIsCreateOpen(true)}
						className="border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
					>
						+ Add Budget
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					{budgets.map((budget) => (
						<BudgetCard
							key={budget.id}
							budget={budget}
							categoryName={getCategoryName(budget.categoryId)}
							formatCurrency={formatCurrency}
							formatDate={formatDate}
							onEdit={handleEdit}
							onDelete={() => setDeleteConfirm(budget.id)}
							deleteConfirm={deleteConfirm}
							handleDeleteConfirm={handleDelete}
							cancelDelete={() => setDeleteConfirm(null)}
						/>
					))}
				</div>
			)}

			{/* Create Budget Modal */}
			{isCreateOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h2 className="text-2xl font-bold uppercase mb-6">Create Budget</h2>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								createForm.handleSubmit();
							}}
							className="space-y-4"
						>
							{/* Category Selection */}
							<createForm.Field
								name="categoryId"
								validators={{
									onChange: ({ value }) =>
										!value ? "Please select a category" : undefined,
								}}
							>
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Category (Expense Only) *
										</label>
										<select
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="">Select Category</option>
											{expenseCategories.map((category) => (
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
							</createForm.Field>

							{/* Amount */}
							<createForm.Field
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
											Budget Amount *
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
							</createForm.Field>

							{/* Period */}
							<createForm.Field name="period">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Period *
										</label>
										<select
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value as "monthly" | "weekly" | "yearly",
												)
											}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
											<option value="yearly">Yearly</option>
										</select>
									</div>
								)}
							</createForm.Field>

							{/* Date Range */}
							<div className="grid grid-cols-2 gap-4">
								<createForm.Field
									name="startDate"
									validators={{
										onChange: ({ value }) =>
											!value ? "Start date is required" : undefined,
									}}
								>
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Start Date *
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
								</createForm.Field>

								<createForm.Field
									name="endDate"
									validators={{
										onChange: ({ value }) =>
											!value ? "End date is required" : undefined,
									}}
								>
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												End Date *
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
								</createForm.Field>
							</div>

							{/* Form Actions */}
							<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={!createForm.state.canSubmit}
									className="flex-1 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
								>
									Create Budget
								</Button>
								<Button
									type="button"
									onClick={() => {
										setIsCreateOpen(false);
										createForm.reset();
									}}
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

			{/* Edit Budget Modal */}
			{isEditOpen && editingBudget && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h2 className="text-2xl font-bold uppercase mb-6">Edit Budget</h2>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								editForm.handleSubmit();
							}}
							className="space-y-4"
						>
							{/* Category (Read-only) */}
							<div>
								<label className="block text-sm font-bold uppercase mb-2">
									Category
								</label>
								<div className="w-full border-2 border-black dark:border-white p-2 bg-gray-100 dark:bg-gray-800 uppercase font-mono opacity-70">
									{getCategoryName(editingBudget.categoryId)}
								</div>
								<p className="text-xs opacity-70 mt-1">
									Cannot change category. Delete and create new budget instead.
								</p>
							</div>

							{/* Amount */}
							<editForm.Field
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
											Budget Amount *
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
							</editForm.Field>

							{/* Period */}
							<editForm.Field name="period">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Period *
										</label>
										<select
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value as "monthly" | "weekly" | "yearly",
												)
											}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
											<option value="yearly">Yearly</option>
										</select>
									</div>
								)}
							</editForm.Field>

							{/* Date Range */}
							<div className="grid grid-cols-2 gap-4">
								<editForm.Field
									name="startDate"
									validators={{
										onChange: ({ value }) =>
											!value ? "Start date is required" : undefined,
									}}
								>
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Start Date *
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
								</editForm.Field>

								<editForm.Field
									name="endDate"
									validators={{
										onChange: ({ value }) =>
											!value ? "End date is required" : undefined,
									}}
								>
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												End Date *
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
								</editForm.Field>
							</div>

							{/* Form Actions */}
							<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={!editForm.state.canSubmit}
									className="flex-1 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
								>
									Update
								</Button>
								<Button
									type="button"
									onClick={resetEditForm}
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

// Budget Card Component with Progress
function BudgetCard({
	budget,
	categoryName,
	formatCurrency,
	formatDate,
	onEdit,
	onDelete,
	deleteConfirm,
	handleDeleteConfirm,
	cancelDelete,
}: {
	budget: any;
	categoryName: string;
	formatCurrency: (amount: string) => string;
	formatDate: (date: string) => string;
	onEdit: (budget: any) => void;
	onDelete: () => void;
	deleteConfirm: string | null;
	handleDeleteConfirm: (id: string) => void;
	cancelDelete: () => void;
}) {
	const trpc = useTRPC();
	const { data: progress } = useQuery(
		trpc.budgets.getProgress.queryOptions({ budgetId: budget.id }),
	);

	const spent = progress ? Number.parseFloat(progress.spent) : 0;
	const budgetAmount = Number.parseFloat(budget.amount);
	const percentage = progress ? Number.parseFloat(progress.percentage) : 0;
	const remaining = budgetAmount - spent;
	const isOverBudget = progress?.isOverBudget || false;

	// Color coding: green (< 80%), yellow (80-100%), red (> 100%)
	const getProgressColor = () => {
		if (isOverBudget) return "bg-red-600 dark:bg-red-400";
		if (percentage >= 80) return "bg-yellow-500 dark:bg-yellow-400";
		return "bg-green-600 dark:bg-green-400";
	};

	const getTextColor = () => {
		if (isOverBudget) return "text-red-600 dark:text-red-400";
		if (percentage >= 80) return "text-yellow-600 dark:text-yellow-500";
		return "text-green-600 dark:text-green-400";
	};

	return (
		<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-6">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
				{/* Category & Period */}
				<div className="md:col-span-3">
					<p className="text-xs uppercase font-bold opacity-70 mb-1">
						Category
					</p>
					<p className="font-bold uppercase text-lg">{categoryName}</p>
					<p className="text-xs uppercase opacity-70 mt-1">{budget.period}</p>
				</div>

				{/* Date Range */}
				<div className="md:col-span-3">
					<p className="text-xs uppercase font-bold opacity-70 mb-1">Period</p>
					<p className="uppercase text-sm">
						{formatDate(budget.startDate)} - {formatDate(budget.endDate)}
					</p>
				</div>

				{/* Budget Amount */}
				<div className="md:col-span-2">
					<p className="text-xs uppercase font-bold opacity-70 mb-1">Budget</p>
					<p className="font-bold text-lg">{formatCurrency(budget.amount)}</p>
				</div>

				{/* Spent Amount */}
				<div className="md:col-span-2">
					<p className="text-xs uppercase font-bold opacity-70 mb-1">Spent</p>
					<p className={`font-bold text-lg ${getTextColor()}`}>
						{formatCurrency(spent.toString())}
					</p>
				</div>

				{/* Remaining */}
				<div className="md:col-span-2">
					<p className="text-xs uppercase font-bold opacity-70 mb-1">
						Remaining
					</p>
					<p className={`font-bold text-lg ${getTextColor()}`}>
						{formatCurrency(remaining.toString())}
					</p>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<p className="text-xs uppercase font-bold opacity-70">Progress</p>
					<p className={`text-sm font-bold ${getTextColor()}`}>
						{percentage.toFixed(1)}%{isOverBudget && " OVER BUDGET!"}
						{!isOverBudget && percentage >= 80 && " WARNING"}
					</p>
				</div>
				<div className="w-full h-6 border-2 border-black dark:border-white bg-white dark:bg-black">
					<div
						className={`h-full ${getProgressColor()} transition-all duration-300`}
						style={{ width: `${Math.min(percentage, 100)}%` }}
					/>
				</div>
			</div>

			{/* Actions */}
			<div className="border-t-2 border-black dark:border-white pt-4">
				{deleteConfirm === budget.id ? (
					<div className="flex items-center gap-2">
						<p className="text-sm font-bold uppercase flex-1">
							Confirm Delete?
						</p>
						<Button
							onClick={() => handleDeleteConfirm(budget.id)}
							variant="destructive"
							size="sm"
							className="uppercase font-bold border-2 border-black dark:border-white"
						>
							Yes, Delete
						</Button>
						<Button
							onClick={cancelDelete}
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
							onClick={() => onEdit(budget)}
							variant="outline"
							size="sm"
							className="uppercase font-bold border-2 border-black dark:border-white"
						>
							Edit
						</Button>
						<Button
							onClick={onDelete}
							variant="outline"
							size="sm"
							className="uppercase font-bold border-2 border-black dark:border-white"
						>
							Delete
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
