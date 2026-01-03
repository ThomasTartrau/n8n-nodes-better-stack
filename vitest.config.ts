import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		globals: false,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["nodes/shared/utils/**/*.ts", "nodes/shared/transport/**/*.ts"],
			exclude: ["nodes/**/index.ts", "nodes/**/interfaces/**/*.ts"],
		},
		testTimeout: 60000,
		hookTimeout: 120000,
	},
});
