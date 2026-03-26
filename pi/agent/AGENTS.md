# Agent Instructions

## Design Context

Before doing any UI or design work, check if `.impeccable.md` exists in the project root.
If present, read it — it contains target audience, brand personality, aesthetic direction,
and design principles that must guide all interface decisions.

Do not infer design context from the codebase — only `.impeccable.md` is authoritative.
Only load it when a task involves building or changing UI (screens, components, styles).

## Code Design Philosophy

Write code that is human-readable, accessible to agents, and favors low cyclomatic complexity.
Simple code is easier to understand, maintain, and debug — for humans and AI alike.

- **Measure before optimizing.** Don't guess where bottlenecks are; profile first.
- **Prefer simple algorithms.** Complexity has costs — more bugs, harder reasoning. Start simple; add sophistication only when measurement proves it's needed.
- **Design data structures first.** Good data organization makes algorithms self-evident.
- **Optimize for readability, not cleverness.** The next reader (human or agent) should grasp intent quickly.
- **Minimize branching.** Fewer conditionals mean fewer edge cases and easier reasoning.

## Coding Conventions

Load the relevant conventions file based on which language the current task involves.
Do not preload both files — load on a need-to-know basis.

- Working with `.rs` files: read ~/.config/pi/agent/conventions/rust.md
- Working with `.ts`/`.tsx` files: read ~/.config/pi/agent/conventions/typescript.md

Treat the loaded conventions as mandatory. They take precedence over general coding habits.

## Commit Messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
The pre-commit hook enforces this; non-conforming messages will be rejected.

### Format

```
<type>(<scope>)[!]: <short summary>

[optional body]

[optional footers]
```

- **Summary line**: imperative mood, no trailing period, max 72 characters.
- **Body**: explain _why_, not _what_. Wrap at 100 characters.
- **Footers**: `BREAKING CHANGE:` trailer is required when `!` is present.

### Types

| Type       | When to use                                                 |
| ---------- | ----------------------------------------------------------- |
| `feat`     | A new feature or endpoint visible to users or API consumers |
| `fix`      | A bug fix                                                   |
| `chore`    | Maintenance that does not affect behaviour                  |
| `refactor` | Code change that neither fixes a bug nor adds a feature     |
| `docs`     | Documentation only                                          |
| `test`     | Adding or updating tests                                    |
| `perf`     | Performance improvement                                     |

### Scopes

Use the part of the codebase most affected (e.g., `api`, `db`, `mobile`, `deps`).

### Breaking Changes

Append `!` after the scope **and** add a `BREAKING CHANGE:` footer.

```
feat(api)!: remove /flashcards endpoint

BREAKING CHANGE: /api/v1/flashcards has been removed. Use /api/v1/quiz/vocabulary instead.
```

Both the `!` and the footer are required.

---

## Cross-Cutting Rules

These apply everywhere, regardless of language:

- Comment _why_, not _what_. Code explains what; comments explain intent and non-obvious decisions.
- Prefer explicit over implicit — if intent or type is unclear at a glance, make it explicit.
- Keep functions small and single-purpose.
- Never introduce a dependency without a clear reason. Note the purpose when you do.
- Do not leave debug logs, dead code, or TODOs without a corresponding explanation.
