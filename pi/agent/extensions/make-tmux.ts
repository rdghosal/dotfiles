import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

// Handle TMPDIR with trailing slash
const tmpDir = process.env.TMPDIR?.replace(/\/$/, "") ?? "/tmp";
const TMUX_SOCKET_DIR = `${tmpDir}/pi-tmux-sockets`;
const TMUX_SOCKET = `${TMUX_SOCKET_DIR}/make.sock`;
const SESSION_NAME = "pi-make";

function getTmuxCmd(): string {
	return `tmux -S "${TMUX_SOCKET}"`;
}

async function isInTmux(): Promise<boolean> {
	return !!process.env.TMUX;
}

async function ensureSession(ctx: ExtensionCommandContext): Promise<boolean> {
	const fs = await import("node:fs/promises");
	const { execSync } = await import("node:child_process");

	// Ensure socket directory exists
	try {
		await fs.mkdir(TMUX_SOCKET_DIR, { recursive: true });
	} catch {
		// Directory may already exist
	}

	const tmux = getTmuxCmd();

	// Check if session exists
	try {
		execSync(`${tmux} has-session -t "${SESSION_NAME}"`, {
			stdio: "pipe",
			timeout: 5000,
		});
		return true;
	} catch {
		// Session doesn't exist, create it
	}

	// Create new session with a single pane
	try {
		execSync(
			`${tmux} new-session -d -s "${SESSION_NAME}" -n make -c "${ctx.cwd}"`,
			{ stdio: "pipe", timeout: 5000 },
		);
		return true;
	} catch (error) {
		ctx.ui.notify(
			`Failed to create tmux session: ${error instanceof Error ? error.message : String(error)}`,
			"error",
		);
		return false;
	}
}

async function runMakeInTmuxPane(target: string, ctx: ExtensionCommandContext, exec: typeof pi.exec): Promise<void> {
	const direction = "horizontal"; // Always horizontal split for make

	// Execute tmux split with make command
	const result = await exec(
		"tmux",
		["split-window", "-h", "-c", ctx.cwd, "make", target],
		{ timeout: 5000 }
	);

	if (result.code !== 0) {
		ctx.ui.notify(`Failed to open make pane: ${result.stderr || "Unknown error"}`, "error");
		return;
	}

	ctx.ui.notify(`Opened make pane (${direction} split) running: make ${target}`, "success");
}

async function runMakeInBackgroundSession(target: string, ctx: ExtensionCommandContext): Promise<void> {
	const { execSync } = await import("node:child_process");
	const tmux = getTmuxCmd();

	// Sanitize window name
	const windowName = target.replace(/[^a-zA-Z0-9_-]/g, "_");
	const windowTarget = `${SESSION_NAME}:${windowName}`;

	try {
		// Check if window already exists and kill it
		try {
			execSync(`${tmux} kill-window -t "${windowTarget}"`, {
				stdio: "pipe",
				timeout: 3000,
			});
		} catch {
			// Window may not exist
		}

		// Create new window in the session
		execSync(
			`${tmux} new-window -d -n "${windowName}" -t "${SESSION_NAME}" -c "${ctx.cwd}"`,
			{ stdio: "pipe", timeout: 5000 },
		);

		// Send the make command
		execSync(
			`${tmux} send-keys -t "${windowTarget}" -l -- "make ${target}"`,
			{ stdio: "pipe", timeout: 3000 },
		);

		// Send Enter to execute
		execSync(`${tmux} send-keys -t "${windowTarget}" Enter`, {
			stdio: "pipe",
			timeout: 3000,
		});

		ctx.ui.notify(`Running \`make ${target}\` in background tmux window "${windowName}"`, "info");
		ctx.ui.notify(`Attach: tmux -S "${TMUX_SOCKET}" attach -t "${SESSION_NAME}"`, "info");
	} catch (error) {
		ctx.ui.notify(
			`Failed to run make: ${error instanceof Error ? error.message : String(error)}`,
			"error",
		);
	}
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("make", {
		description: "Run a make target in a separate tmux pane",
		getArgumentCompletions: (prefix: string) => {
			// Common make targets as suggestions
			const commonTargets = [
				{ value: "build", label: "build - Build the project" },
				{ value: "test", label: "test - Run tests" },
				{ value: "clean", label: "clean - Clean build artifacts" },
				{ value: "dev", label: "dev - Start development server" },
				{ value: "install", label: "install - Install dependencies" },
				{ value: "lint", label: "lint - Run linter" },
				{ value: "fmt", label: "fmt - Format code" },
				{ value: "check", label: "check - Run checks" },
				{ value: "run", label: "run - Run the application" },
				{ value: "docker", label: "docker - Docker operations" },
			];
			const filtered = commonTargets.filter((t) =>
				t.value.toLowerCase().startsWith(prefix.toLowerCase()),
			);
			return filtered.length > 0 ? filtered : null;
		},
		handler: async (args, ctx) => {
			const target = args.trim();

			if (!target) {
				ctx.ui.notify("Usage: /make <target>", "warning");
				ctx.ui.notify("Examples: /make dev, /make build, /make test", "info");
				return;
			}

			// Check if we're in a tmux session
			const inTmux = await isInTmux();

			if (inTmux) {
				// Create a split pane in the current tmux session
				await runMakeInTmuxPane(target, ctx, pi.exec);
			} else {
				// Not in tmux, use background session
				const sessionReady = await ensureSession(ctx);
				if (!sessionReady) {
					return;
				}
				await runMakeInBackgroundSession(target, ctx);
			}
		},
	});

	// Command to attach to the background tmux session
	pi.registerCommand("make-attach", {
		description: "Attach to the background make tmux session",
		handler: async (_args, ctx) => {
			const { spawn } = await import("node:child_process");

			ctx.ui.notify("Attaching to tmux session...", "info");
			ctx.ui.notify("Detach with Ctrl+B then D", "info");

			// Spawn tmux attach - this will take over the terminal
			const child = spawn("tmux", ["-S", TMUX_SOCKET, "attach", "-t", SESSION_NAME], {
				stdio: "inherit",
				detached: false,
			});

			child.on("exit", (code) => {
				if (code !== 0) {
					ctx.ui.notify(`tmux exited with code ${code}`, "warning");
				}
			});
		},
	});

	// Command to view pane output
	pi.registerCommand("make-view", {
		description: "View the output of a make window (defaults to most recent)",
		handler: async (args, ctx) => {
			const { execSync } = await import("node:child_process");
			const tmux = getTmuxCmd();

			const target = args.trim();
			let windowTarget: string;

			if (target) {
				const windowName = target.replace(/[^a-zA-Z0-9_-]/g, "_");
				windowTarget = `${SESSION_NAME}:${windowName}`;
			} else {
				// Use the active window
				windowTarget = SESSION_NAME;
			}

			try {
				const output = execSync(
					`${tmux} capture-pane -p -J -t "${windowTarget}" -S -100`,
					{ encoding: "utf-8", stdio: "pipe", timeout: 3000 },
				);

				// Display in Pi
				const lines = output.trim().split("\n");
				const lastLines = lines.slice(-50); // Show last 50 lines

				ctx.ui.notify(`=== Output from ${target || "active window"} ===`, "info");
				for (const line of lastLines) {
					// Truncate long lines
					const truncated = line.length > 100 ? line.slice(0, 97) + "..." : line;
					ctx.ui.notify(truncated || " ", "info");
				}
			} catch (error) {
				ctx.ui.notify(
					`Failed to capture pane: ${error instanceof Error ? error.message : String(error)}`,
					"error",
				);
				ctx.ui.notify("Run /make-list to see available windows", "info");
			}
		},
	});

	// Command to list make windows
	pi.registerCommand("make-list", {
		description: "List active make tmux windows",
		handler: async (_args, ctx) => {
			const { execSync } = await import("node:child_process");
			const tmux = getTmuxCmd();

			try {
				const output = execSync(
					`${tmux} list-windows -t "${SESSION_NAME}" -F '#{window_index}: #{window_name} (#{window_active}active)'`,
					{ encoding: "utf-8", stdio: "pipe", timeout: 3000 },
				);
				ctx.ui.notify("Active make windows:", "info");
				for (const line of output.trim().split("\n")) {
					ctx.ui.notify(`  ${line}`, "info");
				}
			} catch {
				ctx.ui.notify("No active background session. Run /make <target> first.", "warning");
			}
		},
	});

	// Notify on startup about the tmux session location
	pi.on("session_start", async (_event, ctx) => {
		// Only show if tmux is installed
		try {
			const { execSync } = await import("node:child_process");
			execSync("which tmux", { stdio: "pipe", timeout: 1000 });
			ctx.ui.notify("Make extension: /make <target>, /make-attach, /make-view, /make-list", "info");
		} catch {
			// tmux not installed, don't show the notification
		}
	});
}
