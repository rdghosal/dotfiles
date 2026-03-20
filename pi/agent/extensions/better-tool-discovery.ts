/**
 * Better Tool Discovery Extension
 *
 * Improves tool usage for models that benefit from more explicit instructions
 * (GLM-5, Qwen, Llama, and other non-Anthropic/OpenAI models).
 *
 * Usage:
 * - Automatically detects models that need help (via provider/model ID patterns)
 * - Appends enhanced tool instructions to the system prompt
 * - Use /tool-guide to toggle enhanced instructions manually
 *
 * Config:
 * Set PI_TOOL_GUIDE_PROVIDERS env var to customize which providers get enhanced instructions:
 * PI_TOOL_GUIDE_PROVIDERS="zhipu,ollama,openrouter"
 */

import type { ExtensionAPI, ExtensionContext, BeforeAgentStartEvent } from "@mariozechner/pi-coding-agent";

interface ToolGuideState {
	enabled: boolean;
	providerId?: string;
	modelId?: string;
}

// Providers that typically benefit from enhanced tool instructions
const DEFAULT_ENHANCED_PROVIDERS = new Set([
	"zhipu",        // GLM models
	"ollama",       // Local models
	"openrouter",   // Route through various models
	"groq",         // Fast inference, various models
	"cerebras",     // Fast inference
	"xai",          // Grok
	"mistral",      // Mistral models
	"local",        // Generic local
]);

// Model ID patterns that benefit from enhanced instructions
const ENHANCED_MODEL_PATTERNS = [
	/glm/i,
	/qwen/i,
	/llama/i,
	/mistral/i,
	/gemma/i,
	/deepseek/i,
	/command/i,     // Cohere
	/phi/i,
	/mixtral/i,
	/grok/i,
];

function shouldEnhanceTools(providerId: string, modelId: string): boolean {
	// Check provider
	const providers = process.env.PI_TOOL_GUIDE_PROVIDERS?.split(",").map(p => p.trim().toLowerCase())
		?? Array.from(DEFAULT_ENHANCED_PROVIDERS);

	if (providers.includes(providerId.toLowerCase())) {
		return true;
	}

	// Check model patterns
	const combined = `${providerId}/${modelId}`.toLowerCase();
	return ENHANCED_MODEL_PATTERNS.some(pattern => pattern.test(combined));
}

const ENHANCED_TOOL_INSTRUCTIONS = `

## TOOL USAGE GUIDELINES (IMPORTANT)

You have access to tools. Use them proactively to help the user. Follow these rules:

**WHEN TO USE TOOLS:**
- ALWAYS use tools when the user asks about file contents, code, or project structure
- ALWAYS use tools when the user asks you to read, write, or modify files
- ALWAYS use tools when the user asks about system state (git status, processes, etc.)
- ALWAYS use tools when gathering information before making changes
- ALWAYS check what files exist before creating new ones
- Prefer tools over assumptions — verify instead of guessing

**HOW TO USE TOOLS EFFECTIVELY:**
- Use multiple tools in parallel when they don't depend on each other
- Chain tools sequentially when one tool's output is needed for the next
- After calling a tool, wait for and read its result before responding
- If a tool result is truncated (marked "..."), use it again with offset/limit

**READING FILES:**
- Start with 'read' or 'ls' to understand the project structure
- For large files, read in chunks using offset and limit
- Use 'grep' to find specific code patterns quickly

**EDITING FILES:**
- ALWAYS read the file first before editing
- Use exact text matching for 'edit' — include enough context for unique matches
- For new files, use 'write' with the full content

**RUNNING COMMANDS:**
- Use 'bash' for file operations, git, package management, and builds
- Check command output carefully — errors may be in stderr
- Be cautious with destructive commands (rm, git reset, etc.)

**COMMON MISTAKES TO AVOID:**
- Don't respond from memory when you should use a tool to verify
- Don't assume file contents — read them
- Don't guess project structure — list it
- Don't skip reading tool results — they contain the information you need
`;

const MINIMAL_TOOL_INSTRUCTIONS = `

Remember: You have tools available. Use them proactively instead of responding from memory when the user asks about files, code, or system state.
`;

export default function betterToolDiscoveryExtension(pi: ExtensionAPI) {
	let manualMode: "auto" | "enhanced" | "minimal" | "off" = "auto";
	let currentProvider = "";
	let currentModel = "";

	// Track current model
	pi.on("model_select", async (event) => {
		currentProvider = event.model.provider;
		currentModel = event.model.id;
	});

	// Restore state on session start
	pi.on("session_start", async (_event, ctx) => {
		const model = ctx.model;
		if (model) {
			currentProvider = model.provider;
			currentModel = model.id;
		}
	});

	// Register /tool-guide command
	pi.registerCommand("tool-guide", {
		description: "Toggle enhanced tool usage instructions: /tool-guide [auto|enhanced|minimal|off]",
		handler: async (args, ctx) => {
			const mode = args.trim().toLowerCase() as typeof manualMode;

			if (!mode || mode === "auto") {
				manualMode = "auto";
				ctx.ui.notify("Tool guide: auto (enhanced for compatible models)", "info");
			} else if (["enhanced", "minimal", "off"].includes(mode)) {
				manualMode = mode;
				ctx.ui.notify(`Tool guide: ${mode}`, "info");
			} else {
				ctx.ui.notify("Usage: /tool-guide [auto|enhanced|minimal|off]", "warning");
				return;
			}
		},
	});

	// Modify system prompt based on model and settings
	pi.on("before_agent_start", async (event: BeforeAgentStartEvent) => {
		let extraInstructions = "";

		switch (manualMode) {
			case "enhanced":
				extraInstructions = ENHANCED_TOOL_INSTRUCTIONS;
				break;
			case "minimal":
				extraInstructions = MINIMAL_TOOL_INSTRUCTIONS;
				break;
			case "off":
				return undefined;
			case "auto":
			default:
				if (shouldEnhanceTools(currentProvider, currentModel)) {
					extraInstructions = ENHANCED_TOOL_INSTRUCTIONS;
				}
				break;
		}

		if (extraInstructions) {
			return {
				systemPrompt: event.systemPrompt + extraInstructions,
			};
		}
		return undefined;
	});
}
