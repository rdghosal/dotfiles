/**
 * todo-workers extension - Spawn parallel agents on git worktrees
 *
 * Commands:
 * - /todo-start <id> - Create worktree + tmux pane, claim todo
 * - /todo-stop <id> - Close pane, remove worktree, release todo
 * - /todo-workers - List active workers with status
 * - /todo-workers-layout - Tile all worker panes in a new window
 *
 * State is tracked in .pi/workers.json
 */
import { type ExtensionAPI, type ExtensionContext } from "@mariozechner/pi-coding-agent";
import { StringEnum } from "@mariozechner/pi-ai";
import { Type } from "@sinclair/typebox";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, execSync } from "node:child_process";

const WORKERS_FILE = ".pi/workers.json";
const PANE_CREATION_DELAY_MS = 500;

interface WorkerInfo {
	worktree: string;
	pane: string;
	branch: string;
	started_at: string;
}

interface WorkersState {
	[todoId: string]: WorkerInfo;
}

interface ToolResult {
	content: { type: "text"; text: string }[];
}

const TodoWorkerParams = Type.Object({
	action: StringEnum(["start", "stop", "list", "layout"]),
	id: Type.Optional(Type.String()),
});

type TodoWorkerAction = "start" | "stop" | "list" | "layout";

/**
 * Escapes a string for safe use in shell commands by wrapping in single quotes
 * and escaping any embedded single quotes.
 */
function shellEscape(str: string): string {
	return `'${str.replace(/'/g, "'\"'\"'")}'`;
}

// --- Helper functions ---

function getWorkersFilePath(cwd: string): string {
	return path.join(cwd, WORKERS_FILE);
}

async function readWorkersState(cwd: string): Promise<WorkersState> {
	const filePath = getWorkersFilePath(cwd);
	if (!existsSync(filePath)) return {};
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return JSON.parse(content);
	} catch {
		return {};
	}
}

async function writeWorkersState(cwd: string, state: WorkersState): Promise<void> {
	const filePath = getWorkersFilePath(cwd);
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, JSON.stringify(state, null, 2));
}

function getGitRoot(cwd: string): string | null {
	try {
		return execSync("git rev-parse --show-toplevel", { cwd, encoding: "utf-8" }).trim();
	} catch {
		return null;
	}
}

function hasUncommittedChanges(cwd: string): boolean {
	try {
		const status = execSync("git status --porcelain", { cwd, encoding: "utf-8" });
		return status.trim().length > 0;
	} catch {
		return false;
	}
}

function parseTodoId(input: string): string {
	return input.startsWith("TODO-") ? input.slice(5) : input;
}

function formatTodoId(id: string): string {
	return id.startsWith("TODO-") ? id : `TODO-${id}`;
}

function notify(ctx: ExtensionContext, text: string, level: "success" | "error" | "warning" | "info" = "info") {
	if (ctx.hasUI) {
		ctx.ui.notify(text, level);
	} else {
		console.log(text);
	}
}

function errorResult(text: string): ToolResult {
	return { content: [{ type: "text", text }] };
}

function getNotificationLevel(text: string): "success" | "error" | "warning" | "info" {
	if (text.startsWith("Error")) return "error";
	if (text.startsWith("Warning")) return "warning";
	return "success";
}

// --- Action handlers ---

async function handleStart(todoIdRaw: string, gitRoot: string, ctx: ExtensionContext): Promise<ToolResult> {
	const todoId = parseTodoId(todoIdRaw);
	const displayId = formatTodoId(todoId);
	const workers = await readWorkersState(gitRoot);

	// Validation
	if (workers[todoId]) {
		return errorResult(`Error: ${displayId} already has a worker running`);
	}

	const todoPath = path.join(gitRoot, ".pi", "todos", `${todoId}.md`);
	if (!existsSync(todoPath)) {
		return errorResult(`Error: Todo ${displayId} not found`);
	}

	const branchName = `todo/${todoId}`;
	const worktreeName = `${path.basename(gitRoot)}-${displayId}`;
	const worktreePath = path.join(path.dirname(gitRoot), worktreeName);

	if (existsSync(worktreePath)) {
		return errorResult(`Error: Worktree path ${worktreePath} already exists`);
	}

	// Create worktree and start worker
	try {
		execSync(`git worktree add -b ${branchName} "${worktreePath}"`, {
			cwd: gitRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});

		// Write current-todo marker for auto-claim
		const currentTodoPath = path.join(worktreePath, ".pi", "current-todo");
		await fs.mkdir(path.dirname(currentTodoPath), { recursive: true });
		await fs.writeFile(currentTodoPath, todoId);

		// Split pane and start pi
		spawn("tmux", ["split-window", "-h", "-c", worktreePath, "pi"], {
			stdio: "ignore",
			detached: true,
		});

		// Wait for pane creation and get its ID
		await new Promise((resolve) => setTimeout(resolve, PANE_CREATION_DELAY_MS));
		const newPane = execSync("tmux list-panes -F '#{pane_id}'", { encoding: "utf-8" })
			.trim()
			.split("\n")
			.pop()
			?.trim() || "unknown";

		// Record state
		workers[todoId] = {
			worktree: worktreePath,
			pane: newPane,
			branch: branchName,
			started_at: new Date().toISOString(),
		};
		await writeWorkersState(gitRoot, workers);

		return {
			content: [{
				type: "text",
				text: `Started worker for ${displayId}\n  Worktree: ${worktreePath}\n  Branch: ${branchName}\n  Pane: ${newPane}`,
			}],
		};
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return errorResult(`Error starting worker: ${error}`);
	}
}

async function handleStop(todoIdRaw: string, gitRoot: string, ctx: ExtensionContext): Promise<ToolResult> {
	const todoId = parseTodoId(todoIdRaw);
	const displayId = formatTodoId(todoId);
	const workers = await readWorkersState(gitRoot);
	const worker = workers[todoId];

	if (!worker) {
		return errorResult(`Error: No worker running for ${displayId}`);
	}

	// Check for uncommitted changes
	if (hasUncommittedChanges(worker.worktree)) {
		return {
			content: [{
				type: "text",
				text: `Warning: ${displayId} has uncommitted changes. Commit or stash before stopping.`,
			}],
		};
	}

	try {
		// Kill tmux pane
		try {
			execSync(`tmux kill-pane -t ${shellEscape(worker.pane)}`, { encoding: "utf-8" });
		} catch {
			// Pane may already be closed
		}

		// Remove worktree
		execSync(`git worktree remove ${shellEscape(worker.worktree)}`, { cwd: gitRoot, encoding: "utf-8" });

		// Delete branch (may fail if unmerged)
		try {
			execSync(`git branch -D ${shellEscape(worker.branch)}`, { cwd: gitRoot, encoding: "utf-8" });
		} catch {
			// Branch has unmerged changes, keep it
		}

		// Update state
		delete workers[todoId];
		await writeWorkersState(gitRoot, workers);

		return { content: [{ type: "text", text: `Stopped worker for ${displayId}` }] };
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return errorResult(`Error stopping worker: ${error}`);
	}
}

async function handleList(gitRoot: string): Promise<ToolResult> {
	const workers = await readWorkersState(gitRoot);
	const entries = Object.entries(workers);

	if (entries.length === 0) {
		return { content: [{ type: "text", text: "No active workers" }] };
	}

	const lines = entries.map(([todoId, info]) => {
		const displayId = formatTodoId(todoId);
		const age = Math.round((Date.now() - new Date(info.started_at).getTime()) / 60000);
		const dirty = hasUncommittedChanges(info.worktree) ? " (dirty)" : "";
		return `${displayId}: ${info.branch} [${age}m]${dirty}\n  Worktree: ${info.worktree}\n  Pane: ${info.pane}`;
	});

	return { content: [{ type: "text", text: lines.join("\n") }] };
}

async function handleLayout(gitRoot: string): Promise<ToolResult> {
	const workers = await readWorkersState(gitRoot);
	const entries = Object.entries(workers);

	if (entries.length === 0) {
		return errorResult("No active workers to layout");
	}

	try {
		execSync("tmux new-window -n workers", { encoding: "utf-8" });

		for (let i = 0; i < entries.length; i++) {
			const [, info] = entries[i];
			if (i < entries.length - 1) {
				execSync("tmux split-window -h", { encoding: "utf-8" });
			}
			execSync(`tmux select-pane -t ${i}`, { encoding: "utf-8" });
			execSync(`tmux send-keys -t ${i} ${shellEscape(`cd ${info.worktree} && pi`)} Enter`, { encoding: "utf-8" });
		}

		execSync("tmux select-layout tiled", { encoding: "utf-8" });

		return { content: [{ type: "text", text: `Laid out ${entries.length} workers in tiled layout` }] };
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return errorResult(`Error laying out workers: ${error}`);
	}
}

// --- Command handler helper ---

async function runToolAndNotify(action: TodoWorkerAction, id: string | undefined, ctx: ExtensionContext) {
	const gitRoot = getGitRoot(ctx.cwd);
	if (!gitRoot) {
		notify(ctx, "Error: Not in a git repository", "error");
		return;
	}
	if (!process.env.TMUX) {
		notify(ctx, "Error: Not in a tmux session", "error");
		return;
	}

	let result: ToolResult;
	switch (action) {
		case "start":
			result = await handleStart(id!, gitRoot, ctx);
			break;
		case "stop":
			result = await handleStop(id!, gitRoot, ctx);
			break;
		case "list":
			result = await handleList(gitRoot);
			break;
		case "layout":
			result = await handleLayout(gitRoot);
			break;
	}

	const text = result.content[0].text;
	notify(ctx, text, getNotificationLevel(text));
}

// --- Extension ---

export default function todoWorkersExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "todo_workers",
		label: "Todo Workers",
		description:
			"Manage parallel agents working on todos via git worktrees. " +
			"Actions: start (create worktree + tmux pane), stop (cleanup), list (show workers), layout (tile panes).",
		parameters: TodoWorkerParams,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const action: TodoWorkerAction = params.action;
			const gitRoot = getGitRoot(ctx.cwd);

			if (!gitRoot) return errorResult("Error: Not in a git repository");
			if (!process.env.TMUX) return errorResult("Error: Not in a tmux session. Cannot manage panes.");

			switch (action) {
				case "start":
					if (!params.id) return errorResult("Error: id required for start action");
					return handleStart(params.id, gitRoot, ctx);
				case "stop":
					if (!params.id) return errorResult("Error: id required for stop action");
					return handleStop(params.id, gitRoot, ctx);
				case "list":
					return handleList(gitRoot);
				case "layout":
					return handleLayout(gitRoot);
			}
		},
	});

	pi.registerCommand("todo-start", {
		description: "Start a worker for a todo (creates worktree + tmux pane)",
		getArgumentCompletions: async (prefix: string, ctx: ExtensionContext) => {
			const todosDir = path.join(ctx.cwd, ".pi", "todos");
			if (!existsSync(todosDir)) return [];
			try {
				const files = await fs.readdir(todosDir);
				return files
					.filter((f) => f.endsWith(".md"))
					.map((f) => f.replace(".md", ""))
					.filter((id) => id.startsWith(prefix) || `TODO-${id}`.startsWith(prefix))
					.map((id) => `TODO-${id}`);
			} catch {
				return [];
			}
		},
		handler: async (args, ctx) => {
			const todoId = args?.trim();
			if (!todoId) {
				notify(ctx, "Usage: /todo-start <todo-id>", "error");
				return;
			}
			await runToolAndNotify("start", todoId, ctx);
		},
	});

	pi.registerCommand("todo-stop", {
		description: "Stop a worker and cleanup worktree",
		getArgumentCompletions: async (_prefix: string, ctx: ExtensionContext) => {
			const gitRoot = getGitRoot(ctx.cwd);
			if (!gitRoot) return [];
			const workers = await readWorkersState(gitRoot);
			return Object.keys(workers).map((id) => `TODO-${id}`);
		},
		handler: async (args, ctx) => {
			const todoId = args?.trim();
			if (!todoId) {
				notify(ctx, "Usage: /todo-stop <todo-id>", "error");
				return;
			}
			await runToolAndNotify("stop", todoId, ctx);
		},
	});

	pi.registerCommand("todo-workers", {
		description: "List active todo workers",
		getArgumentCompletions: () => null,
		handler: async (_args, ctx) => {
			await runToolAndNotify("list", undefined, ctx);
		},
	});

	pi.registerCommand("todo-workers-layout", {
		description: "Tile all worker panes in a new window",
		getArgumentCompletions: () => null,
		handler: async (_args, ctx) => {
			await runToolAndNotify("layout", undefined, ctx);
		},
	});
}
