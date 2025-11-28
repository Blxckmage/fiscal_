import { Link } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function FiscalHeader() {
	const { data: session } = useSession();

	const handleSignOut = async () => {
		await signOut();
		window.location.href = "/login";
	};

	if (!session) {
		return null;
	}

	return (
		<header className="border-b-4 border-black dark:border-white bg-white dark:bg-black p-4">
			<div className="container mx-auto flex items-center justify-between">
				<Link to="/" className="text-2xl font-bold uppercase hover:underline">
					fiscal_
				</Link>

				<nav className="flex items-center gap-6">
					<Link
						to="/"
						className="font-bold uppercase hover:underline"
						activeProps={{ className: "font-bold uppercase underline" }}
					>
						Dashboard
					</Link>
					<Link
						to="/accounts"
						className="font-bold uppercase hover:underline"
						activeProps={{ className: "font-bold uppercase underline" }}
					>
						Accounts
					</Link>
					<Link
						to="/transactions"
						className="font-bold uppercase hover:underline"
						activeProps={{ className: "font-bold uppercase underline" }}
					>
						Transactions
					</Link>

					<div className="flex items-center gap-4 ml-4 pl-4 border-l-2 border-black dark:border-white">
						<ThemeToggle />
						<Link to="/profile" className="text-sm uppercase hover:underline">
							{session.user?.email}
						</Link>
						<Button
							onClick={handleSignOut}
							variant="outline"
							className="border-2 border-black dark:border-white uppercase font-bold"
						>
							Logout
						</Button>
					</div>
				</nav>
			</div>
		</header>
	);
}
