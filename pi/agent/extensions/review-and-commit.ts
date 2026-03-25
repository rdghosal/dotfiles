/**
 * Review and Commit Extension
 *
 * Provides a /review command that activates the review-and-commit skill
 * for thorough code review and commit organization.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

async function runReview(ctx: ExtensionCommandContext, piRef: ExtensionAPI) {
  // Check if there are uncommitted changes
  const statusResult = await piRef.exec("git", ["status", "--porcelain"], { cwd: ctx.cwd });

  if (statusResult.stdout.trim() === "" && statusResult.code === 0) {
    ctx.ui.notify("No uncommitted changes to review", "info");
    return;
  }

  // Show status and trigger the review skill
  const files = statusResult.stdout.trim().split("\n").length;
  ctx.ui.notify(`Reviewing ${files} changed file(s)...`, "info");

  // Send the skill command to trigger the review process
  piRef.sendUserMessage("/skill:review-and-commit", { deliverAs: "followUp" });
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("review", {
    description:
      "Review code against AGENTS.md conventions and organize commits per Conventional Commits",
    handler: async (_args, ctx) => {
      await runReview(ctx, pi);
    },
  });

  pi.registerCommand("commit-prep", {
    description: "Alias for /review — prepare commits with proper organization",
    handler: async (_args, ctx) => {
      await runReview(ctx, pi);
    },
  });
}
