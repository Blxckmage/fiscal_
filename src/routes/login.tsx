import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [isSignUp, setIsSignUp] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setLoading(true);

			try {
				if (isSignUp) {
					await signUp.email({
						email: value.email,
						password: value.password,
						name: value.name,
					});
					toast.success("ACCOUNT CREATED SUCCESSFULLY!", {
						description: "Please log in with your credentials",
					});
					// Reset form and switch to login mode
					form.reset();
					setIsSignUp(false);
				} else {
					await signIn.email({
						email: value.email,
						password: value.password,
					});
					navigate({ to: "/" });
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Authentication failed";
				toast.error("AUTHENTICATION ERROR", {
					description: errorMessage,
				});
			} finally {
				setLoading(false);
			}
		},
	});

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
			<div className="w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-black p-8">
				<h1 className="text-4xl font-bold mb-2 uppercase">
					{isSignUp ? "Sign Up" : "Login"}
				</h1>
				<p className="text-sm mb-8 text-muted-foreground">
					{isSignUp ? "Create your fiscal_ account" : "Welcome back to fiscal_"}
				</p>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{isSignUp && (
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) => {
									if (!value || value.length === 0) {
										return "Name is required";
									}
									if (value.length < 2) {
										return "Name must be at least 2 characters";
									}
									return undefined;
								},
							}}
						>
							{(field) => (
								<div>
									<Label htmlFor="name" className="text-sm font-bold uppercase">
										Name
									</Label>
									<Input
										id="name"
										type="text"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="mt-1 border-2 border-black dark:border-white"
										disabled={loading}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-xs text-destructive mt-1 font-bold uppercase">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>
					)}

					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.length === 0) {
									return "Email is required";
								}
								if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
									return "Invalid email format";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div>
								<Label htmlFor="email" className="text-sm font-bold uppercase">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className="mt-1 border-2 border-black dark:border-white"
									disabled={loading}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive mt-1 font-bold uppercase">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="password"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.length === 0) {
									return "Password is required";
								}
								if (value.length < 8) {
									return "Password must be at least 8 characters";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div>
								<Label
									htmlFor="password"
									className="text-sm font-bold uppercase"
								>
									Password
								</Label>
								<Input
									id="password"
									type="password"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className="mt-1 border-2 border-black dark:border-white"
									disabled={loading}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive mt-1 font-bold uppercase">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								className="w-full border-4 border-black dark:border-white bg-accent text-white hover:bg-accent/80 font-bold uppercase"
								disabled={!canSubmit || loading || isSubmitting}
							>
								{loading || isSubmitting
									? "..."
									: isSignUp
										? "Sign Up"
										: "Login"}
							</Button>
						)}
					</form.Subscribe>

					<button
						type="button"
						onClick={() => {
							setIsSignUp(!isSignUp);
							form.reset();
						}}
						className="w-full text-sm text-center hover:underline"
						disabled={loading}
					>
						{isSignUp
							? "Already have an account? Login"
							: "Don't have an account? Sign up"}
					</button>
				</form>
			</div>
		</div>
	);
}
