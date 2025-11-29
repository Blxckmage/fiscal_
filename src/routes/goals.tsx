import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Target, Plus, Trash2, Check, DollarSign } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/goals")({
	component: () => (
		<ProtectedRoute>
			<GoalsPage />
		</ProtectedRoute>
	),
});

function GoalsPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [addingMoneyToId, setAddingMoneyToId] = useState<string | null>(null);
	const [addMoneyAmount, setAddMoneyAmount] = useState("");

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: goals = [] } = useQuery(trpc.goals.getAll.queryOptions());

	const createMutation = useMutation({
		...trpc.goals.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["goals"]] });
			toast.success("Goal created successfully!");
			setIsFormOpen(false);
			form.reset();
		},
	});

	const updateMutation = useMutation({
		...trpc.goals.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["goals"]] });
			toast.success("Goal updated successfully!");
			setEditingId(null);
			setIsFormOpen(false);
			form.reset();
		},
	});

	const deleteMutation = useMutation({
		...trpc.goals.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["goals"]] });
			toast.success("Goal deleted successfully!");
		},
	});

	const addMoneyMutation = useMutation({
		...trpc.goals.addMoney.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["goals"]] });
			toast.success("Money added to goal!");
			setAddingMoneyToId(null);
			setAddMoneyAmount("");
		},
	});

	const editingGoal = goals.find((g: any) => g.id === editingId);

	const form = useForm({
		defaultValues: {
			name: editingGoal?.name || "",
			targetAmount: editingGoal?.targetAmount || "",
			currentAmount: editingGoal?.currentAmount || "0",
			deadline: editingGoal?.deadline || "",
		},
		onSubmit: async ({ value }) => {
			try {
				if (editingId) {
					await updateMutation.mutateAsync({
						id: editingId,
						...value,
						deadline: value.deadline || undefined,
					});
				} else {
					await createMutation.mutateAsync({
						...value,
						deadline: value.deadline || undefined,
					});
				}
			} catch (error) {
				toast.error("Failed to save goal");
			}
		},
	});

	const handleEdit = (goal: any) => {
		setEditingId(goal.id);
		setIsFormOpen(true);
		form.setFieldValue("name", goal.name);
		form.setFieldValue("targetAmount", goal.targetAmount);
		form.setFieldValue("currentAmount", goal.currentAmount);
		form.setFieldValue("deadline", goal.deadline || "");
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this goal?")) {
			await deleteMutation.mutateAsync({ id });
		}
	};

	const handleAddMoney = async (goalId: string) => {
		if (!addMoneyAmount || Number.parseFloat(addMoneyAmount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		await addMoneyMutation.mutateAsync({
			id: goalId,
			amount: addMoneyAmount,
		});
	};

	const formatIDR = (amount: string | number) => {
		const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(num);
	};

	const calculateProgress = (current: string, target: string) => {
		const currentNum = Number.parseFloat(current);
		const targetNum = Number.parseFloat(target);
		return targetNum > 0 ? (currentNum / targetNum) * 100 : 0;
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
						SAVINGS GOALS
					</h1>
					<p className="text-muted-foreground uppercase text-sm tracking-wide">
						TRACK YOUR PROGRESS TOWARDS FINANCIAL TARGETS
					</p>
				</div>
				<Button
					onClick={() => {
						setEditingId(null);
						setIsFormOpen(true);
						form.reset();
					}}
					size="lg"
					className="uppercase"
				>
					<Plus className="mr-2 h-4 w-4" />
					ADD GOAL
				</Button>
			</div>

			{/* Form */}
			{isFormOpen && (
				<Card className="border-4 border-black dark:border-white mb-8">
					<CardHeader>
						<CardTitle className="uppercase">
							{editingId ? "EDIT GOAL" : "CREATE NEW GOAL"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.Field name="name">
									{(field) => (
										<div>
											<Label htmlFor="name" className="uppercase">
												GOAL NAME
											</Label>
											<Input
												id="name"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Emergency Fund"
												className="border-4 border-black dark:border-white uppercase mt-2"
												required
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="targetAmount">
									{(field) => (
										<div>
											<Label htmlFor="targetAmount" className="uppercase">
												TARGET AMOUNT (IDR)
											</Label>
											<Input
												id="targetAmount"
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="10000000"
												className="border-4 border-black dark:border-white font-mono mt-2"
												required
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="currentAmount">
									{(field) => (
										<div>
											<Label htmlFor="currentAmount" className="uppercase">
												CURRENT AMOUNT (IDR)
											</Label>
											<Input
												id="currentAmount"
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0"
												className="border-4 border-black dark:border-white font-mono mt-2"
												required
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="deadline">
									{(field) => (
										<div>
											<Label htmlFor="deadline" className="uppercase">
												DEADLINE (OPTIONAL)
											</Label>
											<Input
												id="deadline"
												type="date"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className="border-4 border-black dark:border-white mt-2"
											/>
										</div>
									)}
								</form.Field>
							</div>

							<div className="flex gap-4">
								<Button type="submit" size="lg" className="uppercase">
									{editingId ? "UPDATE GOAL" : "CREATE GOAL"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="lg"
									onClick={() => {
										setIsFormOpen(false);
										setEditingId(null);
										form.reset();
									}}
									className="border-4 border-black dark:border-white uppercase"
								>
									CANCEL
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{goals.length === 0 && (
				<Card className="border-4 border-black dark:border-white">
					<CardContent className="pt-12 pb-12 text-center">
						<Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-2xl font-bold uppercase mb-2">NO GOALS YET</h3>
						<p className="text-muted-foreground uppercase mb-6">
							START TRACKING YOUR SAVINGS GOALS
						</p>
						<Button
							onClick={() => {
								setEditingId(null);
								setIsFormOpen(true);
							}}
							size="lg"
							className="uppercase"
						>
							<Plus className="mr-2 h-4 w-4" />
							ADD YOUR FIRST GOAL
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Goals Grid */}
			{goals.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{goals.map((goal: any) => {
						const progress = calculateProgress(
							goal.currentAmount,
							goal.targetAmount,
						);
						const isCompleted = goal.isCompleted || progress >= 100;
						const remaining =
							Number.parseFloat(goal.targetAmount) -
							Number.parseFloat(goal.currentAmount);

						return (
							<Card
								key={goal.id}
								className={`border-4 ${
									isCompleted
										? "border-green-500 bg-green-50 dark:bg-green-950/30"
										: "border-black dark:border-white"
								} hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all`}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-xl uppercase flex items-center gap-2">
												{goal.name}
												{isCompleted && (
													<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
												)}
											</CardTitle>
											{goal.deadline && (
												<CardDescription className="uppercase text-xs mt-1">
													DEADLINE: {formatDate(goal.deadline)}
												</CardDescription>
											)}
										</div>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(goal)}
												className="border-2 border-black dark:border-white"
											>
												EDIT
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleDelete(goal.id)}
												className="border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{/* Progress Bar */}
									<div className="mb-4">
										<div className="flex justify-between text-sm uppercase mb-2">
											<span className="font-mono">
												{formatIDR(goal.currentAmount)}
											</span>
											<span className="font-mono text-muted-foreground">
												{formatIDR(goal.targetAmount)}
											</span>
										</div>
										<div className="w-full h-6 border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-800">
											<div
												className={`h-full ${
													isCompleted
														? "bg-green-500 dark:bg-green-400"
														: "bg-blue-500 dark:bg-blue-400"
												} transition-all`}
												style={{ width: `${Math.min(progress, 100)}%` }}
											/>
										</div>
										<div className="text-center mt-2">
											<span className="text-2xl font-bold font-mono">
												{progress.toFixed(1)}%
											</span>
										</div>
									</div>

									{/* Remaining Amount */}
									{!isCompleted && (
										<div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white">
											<p className="text-xs uppercase text-muted-foreground mb-1">
												REMAINING
											</p>
											<p className="text-xl font-bold font-mono">
												{formatIDR(remaining)}
											</p>
										</div>
									)}

									{/* Add Money Section */}
									{!isCompleted && (
										<div className="space-y-2">
											{addingMoneyToId === goal.id ? (
												<div className="flex gap-2">
													<Input
														type="number"
														step="1"
														value={addMoneyAmount}
														onChange={(e) => setAddMoneyAmount(e.target.value)}
														placeholder="0"
														className="border-4 border-black dark:border-white font-mono"
													/>
													<Button
														onClick={() => handleAddMoney(goal.id)}
														className="uppercase"
													>
														ADD
													</Button>
													<Button
														variant="outline"
														onClick={() => {
															setAddingMoneyToId(null);
															setAddMoneyAmount("");
														}}
														className="border-4 border-black dark:border-white"
													>
														✕
													</Button>
												</div>
											) : (
												<Button
													onClick={() => setAddingMoneyToId(goal.id)}
													className="w-full uppercase"
													variant="outline"
												>
													<DollarSign className="mr-2 h-4 w-4" />
													ADD MONEY
												</Button>
											)}
										</div>
									)}

									{isCompleted && (
										<div className="text-center py-4">
											<p className="text-lg font-bold uppercase text-green-600 dark:text-green-400">
												🎉 GOAL COMPLETED! 🎉
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
