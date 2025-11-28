import { useSession } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: "/login" });
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="border-4 border-black p-8 bg-white">
					<p className="text-xl font-bold uppercase">Loading...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return <>{children}</>;
}
