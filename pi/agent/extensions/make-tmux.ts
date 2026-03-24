/**
 * Make Tmux Extension - Run make commands in tmux panes
 *
 * When inside tmux: creates a visible split pane
 * When outside tmux: uses a background session
 *
 * Commands:
 *   /make <target>     - Run make target
 *   /make-attach       - Attach to background session
 *   /make-view [target] - View pane output
 *   /make-list         - List windows
 */

import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs/promises";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TMUX_SOCKET_DIR = `${(process.env.TMPDIR ?? "/tmp").replace(/\/$/, "")}/pi-tmux-sockets`;
const TMUX_SOCKET = `${TMUX_SOCKET_DIR}/make.sock`;
const SESSION_NAME = "pi-make";

const COMMON_MAKE_TARGETS: AutocompleteItem[] = [
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

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Build tmux command with our socket path */
function tmux(args: string[]): string {
	return `tmux -S "${TMUX_SOCKET}" ${args.join(" ")}`;
}

/** Check if currently running inside a tmux session */
function isInTmux(): boolean {
	return !!process.env.TMUX;
}

/** Sanitize target name for use as tmux window name */
function sanitizeWindowName(target: string): string {
	return target.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Validate make target - only allow safe characters */
function isValidTarget(target: string): boolean {
	// Allow alphanumeric, dash, underscore, colon, dot, slash for paths
	return /^[a-zA-Z0-9_:/.-]+$/.test(target) && target.length > 0;
}

/** Escape a string for safe use in shell single quotes */
function shellEscape(str: string): string {
	// Replace single quotes with: end quote, escaped quote, start quote
	return str.replace(/'/g, "'\"'\"'");
}

/** Format error for user notification */
function formatError(context: string, error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return `${context}: ${message}`;
}

/** Execute shell command with consistent timeout and error handling */
function exec(cmd: string, timeoutMs = 5000): void {
	execSync(cmd, { stdio: "pipe", timeout: timeoutMs });
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Management (for background mode)
// ─────────────────────────────────────────────────────────────────────────────

async function ensureSocketDir(): Promise<void> {
	await fs.mkdir(TMUX_SOCKET_DIR, { recursive: true });
}

function sessionExists(): boolean {
	try {
		exec(tmux(["has-session", "-t", SESSION_NAME]), 3000);
		return true;
	} catch {
		return false;
	}
}

function createSession(cwd: string): void {
	exec(tmux(["new-session", "-d", "-s", SESSION_NAME, "-n", "make", "-c", `'${shellEscape(cwd)}'`]));
}

async function ensureBackgroundSession(ctx: ExtensionContext): Promise<boolean> {
	try {
		await ensureSocketDir();
		if (!sessionExists()) {
			createSession(ctx.cwd);
		}
		return true;
	} catch (error) {
		ctx.ui.notify(formatError("Failed to create tmux session", error), "error");
		return false;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Make Execution
// ─────────────────────────────────────────────────────────────────────────────

async function runMakeInSplitPane(
	target: string,
	ctx: ExtensionCommandContext,
	execFn: typeof pi.exec,
): Promise<void> {
	const result = await execFn(
		"tmux",
		["split-window", "-h", "-c", ctx.cwd, "make", target],
		{ timeout: 5000 },
	);

	if (result.code !== 0) {
		ctx.ui.notify(`Failed to open make pane: ${result.stderr || "Unknown error"}`, "error");
		return;
	}

	ctx.ui.notify(`Opened make pane (horizontal split) running: make ${target}`, "success");
}

async function runMakeInBackgroundSession(
	target: string,
	ctx: ExtensionCommandContext,
): Promise<void> {
	const windowName = sanitizeWindowName(target);
	const windowTarget = `${SESSION_NAME}:${windowName}`;

	try {
		// Kill existing window with same name
		try {
			exec(tmux(["kill-window", "-t", windowTarget]), 3000);
		} catch {
			// Window may not exist
		}

		// Create window with escaped cwd
		exec(tmux(["new-window", "-d", "-n", windowName, "-t", SESSION_NAME, "-c", `'${shellEscape(ctx.cwd)}'`]));
		// Send make command with properly escaped target (single-quote wrapped)
		exec(tmux(["send-keys", "-t", windowTarget, "-l", "--", `'make ${shellEscape(target)}'`]), 3000);
		exec(tmux(["send-keys", "-t", windowTarget, "Enter"]), 3000);

		ctx.ui.notify(`Running \`make ${target}\` in background window "${windowName}"`, "info");
		ctx.ui.notify(`Attach: tmux -S "${TMUX_SOCKET}" attach -t "${SESSION_NAME}"`, "info");
	} catch (error) {
		ctx.ui.notify(formatError("Failed to run make", error), "error");
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Command Handlers
// ─────────────────────────────────────────────────────────────────────────────

function getCompletions(prefix: string): AutocompleteItem[] | null {
	const filtered = COMMON_MAKE_TARGETS.filter((t) =>
		t.value.toLowerCase().startsWith(prefix.toLowerCase()),
	);
	return filtered.length > 0 ? filtered : null;
}

async function handleMake(
	target: string,
	ctx: ExtensionCommandContext,
	execFn: typeof pi.exec,
): Promise<void> {
	if (!target) {
		ctx.ui.notify("Usage: /make <target>", "warning");
		ctx.ui.notify("Examples: /make dev, /make build, /make test", "info");
		return;
	}

	if (!isValidTarget(target)) {
		ctx.ui.notify(
			"Invalid target: only alphanumeric characters, dash, underscore, colon, dot, and slash are allowed",
			"error",
		);
		return;
	}

	if (isInTmux()) {
		await runMakeInSplitPane(target, ctx, execFn);
	} else {
		const ready = await ensureBackgroundSession(ctx);
		if (ready) {
			await runMakeInBackgroundSession(target, ctx);
		}
	}
}

async function handleAttach(ctx: ExtensionCommandContext): Promise<void> {
	ctx.ui.notify("Attaching to tmux session...", "info");
	ctx.ui.notify("Detach with Ctrl+B then D", "info");

	const child = spawn("tmux", ["-S", TMUX_SOCKET, "attach", "-t", SESSION_NAME], {
		stdio: "inherit",
		detached: false,
	});

	child.on("exit", (code) => {
		if (code !== 0) {
			ctx.ui.notify(`tmux exited with code ${code}`, "warning");
		}
	});
}

async function handleView(target: string | undefined, ctx: ExtensionCommandContext): Promise<void> {
	if (target && !isValidTarget(target)) {
		ctx.ui.notify(
			"Invalid target: only alphanumeric characters, dash, underscore, colon, dot, and slash are allowed",
			"error",
		);
		return;
	}

	const windowTarget = target
		? `${SESSION_NAME}:${sanitizeWindowName(target)}`
		: SESSION_NAME;

	try {
		const output = execSync(tmux(["capture-pane", "-p", "-J", "-t", windowTarget, "-S", "-100"]), {
			encoding: "utf-8",
			stdio: "pipe",
			timeout: 3000,
		});

		const lines = output.trim().split("\n").slice(-50);
		const label = target || "active window";

		ctx.ui.notify(`=== Output from ${label} ===`, "info");
		for (const line of lines) {
			const display = line.length > 100 ? `${line.slice(0, 97)}...` : line;
			ctx.ui.notify(display || " ", "info");
		}
	} catch (error) {
		ctx.ui.notify(formatError("Failed to capture pane", error), "error");
		ctx.ui.notify("Run /make-list to see available windows", "info");
	}
}

async function handleList(ctx: ExtensionCommandContext): Promise<void> {
	try {
		const output = execSync(
			tmux(["list-windows", "-t", SESSION_NAME, "-F", "#{window_index}: #{window_name} (#{window_active}active)"]),
			{ encoding: "utf-8", stdio: "pipe", timeout: 3000 },
		);

		ctx.ui.notify("Active make windows:", "info");
		for (const line of output.trim().split("\n")) {
			ctx.ui.notify(`  ${line}`, "info");
		}
	} catch {
		ctx.ui.notify("No active background session. Run /make <target> first.", "warning");
	}
}

function hasTmuxInstalled(): boolean {
	try {
		execSync("which tmux", { stdio: "pipe", timeout: 1000 });
		return true;
	} catch {
		return false;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Extension Export
// ─────────────────────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	// Main /make command
	pi.registerCommand("make", {
		description: "Run a make target in a separate tmux pane",
		getArgumentCompletions: (prefix) => getCompletions(prefix),
		handler: (args, ctx) => handleMake(args.trim(), ctx, pi.exec),
	});

	// Helper commands
	pi.registerCommand("make-attach", {
		description: "Attach to the background make tmux session",
		handler: (_args, ctx) => handleAttach(ctx),
	});

	pi.registerCommand("make-view", {
		description: "View the output of a make window (defaults to most recent)",
		handler: (args, ctx) => handleView(args.trim() || undefined, ctx),
	});

	pi.registerCommand("make-list", {
		description: "List active make tmux windows",
		handler: (_args, ctx) => handleList(ctx),
	});

	// Startup notification
	pi.on("session_start", (_event, ctx) => {
		if (hasTmuxInstalled()) {
			ctx.ui.notify("Make: /make <target>, /make-attach, /make-view, /make-list", "info");
		}
	});
}
