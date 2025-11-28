import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "@/components/ui/sonner";

import Header from "../components/Header";
import FiscalHeader from "../components/FiscalHeader";
import { ThemeProvider } from "../components/ThemeProvider";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

import type { TRPCRouter } from "@/integrations/trpc/router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

interface MyRouterContext {
	queryClient: QueryClient;

	trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "fiscal_ - Personal Finance Manager",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const isDemoRoute = location.pathname.startsWith("/demo");
	const isLoginRoute = location.pathname === "/login";

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{isDemoRoute && <Header />}
					{!isDemoRoute && !isLoginRoute && <FiscalHeader />}
					<div className="min-h-screen">{children}</div>
					<Toaster />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
