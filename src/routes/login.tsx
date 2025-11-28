import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isSignUp) {
				await signUp.email({
					email,
					password,
					name,
				});
			} else {
				await signIn.email({
					email,
					password,
				});
			}
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md border-4 border-black bg-white p-8">
				<h1 className="text-4xl font-bold mb-2 uppercase">
					{isSignUp ? "Sign Up" : "Login"}
				</h1>
				<p className="text-sm mb-8 text-muted-foreground">
					{isSignUp ? "Create your fiscal account" : "Welcome back to fiscal"}
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<div>
							<Label htmlFor="name" className="text-sm font-bold uppercase">
								Name
							</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required={isSignUp}
								className="mt-1 border-2 border-black"
								disabled={loading}
							/>
						</div>
					)}

					<div>
						<Label htmlFor="email" className="text-sm font-bold uppercase">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 border-2 border-black"
							disabled={loading}
						/>
					</div>

					<div>
						<Label htmlFor="password" className="text-sm font-bold uppercase">
							Password
						</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-1 border-2 border-black"
							disabled={loading}
						/>
					</div>

					{error && (
						<div className="border-2 border-destructive bg-destructive/10 p-3 text-sm">
							{error}
						</div>
					)}

					<Button
						type="submit"
						className="w-full border-4 border-black bg-accent text-white hover:bg-accent/80 font-bold uppercase"
						disabled={loading}
					>
						{loading ? "..." : isSignUp ? "Sign Up" : "Login"}
					</Button>

					<button
						type="button"
						onClick={() => {
							setIsSignUp(!isSignUp);
							setError("");
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
