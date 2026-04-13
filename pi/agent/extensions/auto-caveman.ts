import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const SKILL_PATH = join(homedir(), ".agents/skills/caveman/SKILL.md");

interface LoadResult {
  readonly ok: true;
  readonly content: string;
  readonly strippedContent: string;
}

interface LoadError {
  readonly ok: false;
  readonly error: string;
}

type LoadOutcome = LoadResult | LoadError;

function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("---", 3);
  if (end === -1) return text;
  return text.slice(end + 3).replace(/^\n+/, "");
}

let cachedSkill: LoadOutcome | null = null;

async function loadSkill(): Promise<LoadOutcome> {
  if (cachedSkill?.ok) return cachedSkill;

  try {
    const raw = await readFile(SKILL_PATH, "utf-8");
    const stripped = stripFrontmatter(raw);
    const result: LoadResult = { ok: true, content: raw, strippedContent: stripped };
    cachedSkill = result;
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const error: LoadError = { ok: false, error: msg };
    cachedSkill = null;
    return error;
  }
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (event, ctx) => {
    if (event.reason !== "startup") {
      console.log(`[auto-caveman] skipping session_start (${event.reason})`);
      return;
    }

    const result = await loadSkill();

    if (!result.ok) {
      ctx.ui.notify(`auto-caveman: failed to load skill — ${result.error}`, "error");
      console.log(`[auto-caveman] load failed: ${result.error}`);
      return;
    }

    ctx.ui.notify("auto-caveman: skill loaded ✓", "info");
    console.log(`[auto-caveman] loaded (${result.strippedContent.length} chars)`);
  });

  pi.on("before_agent_start", (event) => {
    if (!cachedSkill?.ok) return;

    return {
      systemPrompt:
        event.systemPrompt +
        "\n\n---\n\n## Communication Mode: Caveman\n\n" +
        cachedSkill.strippedContent,
    };
  });
}
