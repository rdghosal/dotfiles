/**
 * Update Pi Extension
 *
 * Allows updating pi to the latest version without leaving the session.
 *
 * Usage:
 * - Type `/update` to check for updates and optionally update
 * - The LLM can call the `update_pi` tool to update automatically
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

interface UpdateResult {
  success: boolean;
  previousVersion?: string;
  newVersion?: string;
  output: string;
  error?: string;
}

async function getCurrentVersion(pi: ExtensionAPI): Promise<string | undefined> {
  try {
    const result = await pi.exec("npm", ["list", "-g", "@mariozechner/pi-coding-agent", "--json"], {
      timeout: 10000,
    });
    if (result.code === 0) {
      const parsed = JSON.parse(result.stdout);
      const pkg = parsed.dependencies?.["@mariozechner/pi-coding-agent"];
      return pkg?.version;
    }
  } catch {
    // ignore
  }
  return undefined;
}

async function checkForUpdate(
  pi: ExtensionAPI
): Promise<{ current?: string; latest?: string; hasUpdate: boolean }> {
  const current = await getCurrentVersion(pi);

  try {
    // Get latest version from npm registry
    const result = await pi.exec("npm", ["view", "@mariozechner/pi-coding-agent", "version"], {
      timeout: 10000,
    });
    const latest = result.stdout.trim();
    return {
      current,
      latest,
      hasUpdate: current !== latest,
    };
  } catch {
    return { current, latest: undefined, hasUpdate: false };
  }
}

async function performUpdate(pi: ExtensionAPI, signal?: AbortSignal): Promise<UpdateResult> {
  const previousVersion = await getCurrentVersion(pi);

  try {
    const result = await pi.exec("npm", ["update", "-g", "@mariozechner/pi-coding-agent"], {
      signal,
      timeout: 120000,
    });

    const newVersion = await getCurrentVersion(pi);

    return {
      success: result.code === 0,
      previousVersion,
      newVersion,
      output: result.stdout + (result.stderr ? `\n${result.stderr}` : ""),
    };
  } catch (error) {
    return {
      success: false,
      previousVersion,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export default function updatePiExtension(pi: ExtensionAPI) {
  // Register the /update command
  pi.registerCommand("update", {
    description: "Check for and install pi updates",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Checking for updates...", "info");

      const { current, latest, hasUpdate } = await checkForUpdate(pi);

      if (!current) {
        ctx.ui.notify("Could not determine current pi version", "warning");
        return;
      }

      if (!latest) {
        ctx.ui.notify("Could not check for latest version", "warning");
        return;
      }

      if (!hasUpdate) {
        ctx.ui.notify(`pi is up to date (v${current})`, "success");
        return;
      }

      const shouldUpdate = await ctx.ui.confirm(
        "Update Available",
        `Current: v${current}\nLatest: v${latest}\n\nUpdate now?`
      );

      if (!shouldUpdate) {
        return;
      }

      ctx.ui.notify("Updating pi...", "info");
      const result = await performUpdate(pi);

      if (result.success) {
        const versionMsg =
          result.newVersion && result.newVersion !== result.previousVersion
            ? `v${result.previousVersion} → v${result.newVersion}`
            : "updated";
        ctx.ui.notify(`pi ${versionMsg}. Run /reload to use the new version.`, "success");
      } else {
        ctx.ui.notify(`Update failed: ${result.error || "unknown error"}`, "error");
      }
    },
  });

  // Register the update_pi tool for the LLM
  pi.registerTool({
    name: "update_pi",
    label: "Update Pi",
    description:
      "Update pi to the latest version from npm. Checks current version, fetches the latest, and performs the update if needed.",
    promptSnippet: "Update pi coding agent to the latest npm version",
    parameters: Type.Object({
      force: Type.Optional(
        Type.Boolean({
          description: "Skip confirmation and update immediately",
          default: false,
        })
      ),
    }),

    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      onUpdate?.({
        content: [{ type: "text", text: "Checking for updates..." }],
        details: { phase: "checking" },
      });

      const { current, latest, hasUpdate } = await checkForUpdate(pi);

      if (!current) {
        throw new Error("Could not determine current pi version");
      }

      if (!latest) {
        throw new Error("Could not check for latest version from npm registry");
      }

      if (!hasUpdate) {
        return {
          content: [{ type: "text", text: `pi is already up to date (v${current})` }],
          details: { current, latest, updated: false },
        };
      }

      // If not forced, we would normally ask for confirmation
      // But in tool context, we'll proceed with the update
      onUpdate?.({
        content: [{ type: "text", text: `Updating from v${current} to v${latest}...` }],
        details: { phase: "updating", previous: current, target: latest },
      });

      const result = await performUpdate(pi, signal);

      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }

      const finalVersion = result.newVersion || latest;
      const versionChanged = result.newVersion && result.newVersion !== current;

      return {
        content: [
          {
            type: "text",
            text: versionChanged
              ? `pi updated successfully from v${current} to v${finalVersion}. Run /reload to use the new version.`
              : `pi update completed (still on v${current}). Run /reload to ensure the latest version is active.`,
          },
        ],
        details: {
          previousVersion: current,
          newVersion: finalVersion,
          updated: versionChanged,
          output: result.output,
        },
      };
    },
  });
}
