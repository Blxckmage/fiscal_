import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/accounts")({
	component: () => (
		<ProtectedRoute>
			<AccountsPage />
		</ProtectedRoute>
	),
});

type AccountFormData = {
	name: string;
	type: "bank" | "cash" | "e-wallet" | "credit-card";
	balance: string;
	currency: string;
	color?: string;
	icon?: string;
};

function AccountsPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: accounts = [] } = useQuery(trpc.accounts.getAll.queryOptions());
	const createMutation = useMutation({
		...trpc.accounts.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["accounts"]] });
		},
	});
	const updateMutation = useMutation({
		...trpc.accounts.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["accounts"]] });
		},
	});
	const deleteMutation = useMutation({
		...trpc.accounts.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["accounts"]] });
		},
	});

	const editingAccount = accounts.find((a: any) => a.id === editingId);

	const form = useForm({
		defaultValues: {
			name: editingAccount?.name || "",
			type: editingAccount?.type || ("bank" as const),
			balance: editingAccount?.balance || "0",
			currency: editingAccount?.currency || "IDR",
			color: editingAccount?.color || "",
			icon: editingAccount?.icon || "",
		},
		onSubmit: async ({ value }) => {
			try {
				if (editingId) {
					await updateMutation.mutateAsync({
						id: editingId,
						name: value.name,
						type: value.type,
						color: value.color || undefined,
						icon: value.icon || undefined,
					});
					toast.success("Account updated successfully!");
				} else {
					await createMutation.mutateAsync(value);
					toast.success("Account created successfully!");
				}
				resetForm();
			} catch (error) {
				toast.error("Failed to save account");
			}
		},
	});

	const resetForm = () => {
		setIsFormOpen(false);
		setEditingId(null);
		form.reset();
	};

	const handleEdit = (account: (typeof accounts)[0]) => {
		setEditingId(account.id);
		setIsFormOpen(true);
		// Update form values
		form.setFieldValue("name", account.name);
		form.setFieldValue("type", account.type);
		form.setFieldValue("balance", account.balance);
		form.setFieldValue("currency", account.currency);
		form.setFieldValue("color", account.color || "");
		form.setFieldValue("icon", account.icon || "");
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
			toast.success("Account deleted successfully!");
			setDeleteConfirm(null);
		} catch (error) {
			toast.error("Failed to delete account");
		}
	};

	const formatCurrency = (amount: string, currency: string) => {
		const num = Number.parseFloat(amount);
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(num);
	};

	const getTypeLabel = (type: string) => {
		return type
			.split("-")
			.map((word) => word.toUpperCase())
			.join(" ");
	};

	return (
		<div className="container mx-auto p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold uppercase">Accounts</h1>
				<Button
					onClick={() => {
						resetForm();
						setIsFormOpen(true);
					}}
					className="border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white uppercase font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
				>
					+ Add Account
				</Button>
			</div>

			{/* Account List */}
			{accounts.length === 0 ? (
				<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 text-center">
					<p className="text-xl uppercase font-bold mb-4">No Accounts Yet</p>
					<p className="mb-4">
						Create your first account to start tracking finances
					</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{accounts.map((account) => (
						<div
							key={account.id}
							className="border-4 border-black dark:border-white bg-white dark:bg-black p-6"
						>
							<div className="flex items-start justify-between mb-4">
								<div>
									<h3 className="text-xl font-bold uppercase mb-1">
										{account.name}
									</h3>
									<p className="text-sm uppercase opacity-70">
										{getTypeLabel(account.type)}
									</p>
								</div>
								{!account.isActive && (
									<span className="text-xs uppercase font-bold border-2 border-black dark:border-white px-2 py-1">
										Inactive
									</span>
								)}
							</div>

							<div className="mb-6">
								<p className="text-3xl font-bold">
									{formatCurrency(account.balance, account.currency)}
								</p>
							</div>

							{deleteConfirm === account.id ? (
								<div className="space-y-2">
									<p className="text-sm font-bold uppercase">Confirm Delete?</p>
									<div className="flex gap-2">
										<Button
											onClick={() => handleDelete(account.id)}
											variant="destructive"
											className="flex-1 uppercase font-bold border-2 border-black dark:border-white"
										>
											Yes, Delete
										</Button>
										<Button
											onClick={() => setDeleteConfirm(null)}
											variant="outline"
											className="flex-1 uppercase font-bold border-2 border-black dark:border-white"
										>
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div className="flex gap-2">
									<Button
										onClick={() => handleEdit(account)}
										variant="outline"
										className="flex-1 uppercase font-bold border-2 border-black dark:border-white"
									>
										Edit
									</Button>
									<Button
										onClick={() => setDeleteConfirm(account.id)}
										variant="outline"
										className="flex-1 uppercase font-bold border-2 border-black dark:border-white"
									>
										Delete
									</Button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Add/Edit Form */}
			{isFormOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold uppercase mb-6">
							{editingId ? "Edit Account" : "Add Account"}
						</h2>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							{/* Name Field */}
							<form.Field name="name">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Account Name *
										</label>
										<input
											type="text"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
											placeholder="MY BANK"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Type Field */}
							<form.Field name="type">
								{(field) => (
									<div>
										<label className="block text-sm font-bold uppercase mb-2">
											Account Type *
										</label>
										<select
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value as AccountFormData["type"],
												)
											}
											onBlur={field.handleBlur}
											className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
										>
											<option value="bank">BANK</option>
											<option value="cash">CASH</option>
											<option value="e-wallet">E-WALLET</option>
											<option value="credit-card">CREDIT CARD</option>
										</select>
									</div>
								)}
							</form.Field>

							{/* Balance Field - Only show for new accounts */}
							{!editingId && (
								<form.Field name="balance">
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Initial Balance *
											</label>
											<input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
												placeholder="0"
											/>
										</div>
									)}
								</form.Field>
							)}

							{/* Currency Field - Only show for new accounts */}
							{!editingId && (
								<form.Field name="currency">
									{(field) => (
										<div>
											<label className="block text-sm font-bold uppercase mb-2">
												Currency *
											</label>
											<select
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												className="w-full border-2 border-black dark:border-white p-2 bg-white dark:bg-black uppercase font-mono"
											>
												<option value="IDR">IDR - Indonesian Rupiah</option>
												<option value="USD">USD - US Dollar</option>
												<option value="EUR">EUR - Euro</option>
												<option value="GBP">GBP - British Pound</option>
												<option value="JPY">JPY - Japanese Yen</option>
												<option value="CNY">CNY - Chinese Yuan</option>
												<option value="SGD">SGD - Singapore Dollar</option>
												<option value="MYR">MYR - Malaysian Ringgit</option>
												<option value="THB">THB - Thai Baht</option>
												<option value="AUD">AUD - Australian Dollar</option>
												<option value="CAD">CAD - Canadian Dollar</option>
											</select>
										</div>
									)}
								</form.Field>
							)}

							{/* Form Actions */}
							<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={!form.state.canSubmit}
									className="flex-1 border-4 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
								>
									{editingId ? "Update" : "Create"}
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
