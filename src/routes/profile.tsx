import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/profile")({
	component: () => (
		<ProtectedRoute>
			<ProfilePage />
		</ProtectedRoute>
	),
});

function ProfilePage() {
	const { data: session } = useSession();

	return (
		<div className="container mx-auto p-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold uppercase mb-2">Profile</h1>
				<p className="uppercase text-sm opacity-70">Your Account Information</p>
			</div>

			{/* User Info Card */}
			<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 mb-6">
				<h2 className="text-xl font-bold uppercase mb-6">User Information</h2>

				<div className="space-y-4">
					{/* Email */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1 opacity-70">
							Email
						</label>
						<p className="text-lg uppercase font-mono">
							{session?.user?.email || "N/A"}
						</p>
					</div>

					{/* Name */}
					{session?.user?.name && (
						<div>
							<label className="block text-xs font-bold uppercase mb-1 opacity-70">
								Name
							</label>
							<p className="text-lg uppercase font-mono">{session.user.name}</p>
						</div>
					)}

					{/* User ID */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1 opacity-70">
							User ID
						</label>
						<p className="text-sm font-mono opacity-70">
							{session?.user?.id || "N/A"}
						</p>
					</div>

					{/* Account Created */}
					{session?.user?.createdAt && (
						<div>
							<label className="block text-xs font-bold uppercase mb-1 opacity-70">
								Account Created
							</label>
							<p className="text-sm font-mono opacity-70">
								{new Date(session.user.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Session Info Card */}
			<div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8">
				<h2 className="text-xl font-bold uppercase mb-6">
					Session Information
				</h2>

				<div className="space-y-4">
					{/* Session ID */}
					<div>
						<label className="block text-xs font-bold uppercase mb-1 opacity-70">
							Session ID
						</label>
						<p className="text-sm font-mono opacity-70 break-all">
							{session?.session?.id || "N/A"}
						</p>
					</div>

					{/* Expires At */}
					{session?.session?.expiresAt && (
						<div>
							<label className="block text-xs font-bold uppercase mb-1 opacity-70">
								Session Expires
							</label>
							<p className="text-sm font-mono opacity-70">
								{new Date(session.session.expiresAt).toLocaleDateString(
									"en-US",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									},
								)}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
