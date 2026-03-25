/**
 * Git Pane Command - Open a tmux pane with nvim running Fugitive :Git
 *
 * Usage in pi: /git [h|v]
 *   /git     - Horizontal split (side by side, default)
 *   /git h   - Same as above
 *   /git v   - Vertical split (top/bottom)
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

async function openGitPane(args: string, ctx: ExtensionCommandContext, exec: typeof pi.exec) {
  const direction = args.trim() === "v" ? "vertical" : "horizontal";
  const tmuxFlag = direction === "horizontal" ? "-h" : "-v";

  // Check if we're in a tmux session
  const tmuxEnv = process.env.TMUX;
  if (!tmuxEnv) {
    ctx.ui.notify("Error: Not running inside a tmux session", "error");
    return;
  }

  // Execute tmux split with nvim + Git command
  const result = await exec(
    "tmux",
    ["split-window", tmuxFlag, "-c", ctx.cwd, "nvim", "-c", "Git"],
    { timeout: 5000 }
  );

  if (result.code !== 0) {
    ctx.ui.notify(`Failed to open git pane: ${result.stderr || "Unknown error"}`, "error");
    return;
  }

  ctx.ui.notify(`Opened git pane (${direction} split)`, "success");
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("git", {
    description:
      "Open a tmux pane with nvim showing git status via Fugitive (:Git). Usage: /git [h|v]",
    handler: async (args, ctx) => {
      await openGitPane(args, ctx, pi.exec);
    },
  });
}
