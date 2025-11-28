import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				type="button"
				className="border-4 border-black bg-white px-4 py-2 font-bold uppercase hover:bg-black hover:text-white transition-colors"
			>
				...
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-4 py-2 font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
		>
			{theme === "dark" ? "LIGHT" : "DARK"}
		</button>
	);
}
