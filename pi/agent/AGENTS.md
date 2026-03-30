# Agent Instructions

## Accuracy & Uncertainty

- **Ask before assuming.** When requirements, context, or facts are unclear, ask for clarification. Guessing leads to wrong solutions.
- **Seek clarity proactively.** If information isn't available, ask for it. Don't fabricate facts, paths, API signatures, or error messages.
- **Verify before asserting.** Use tools to check file contents, command outputs, and system state. Don't rely on memory or inference.
- **Distinguish fact from inference.** State what you know from evidence, and clearly mark what you're inferring or proposing.
- **Questions over guesses.** An asked question leads to the right answer. A guessed answer leads to rework.

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

## Security Practices

### Input Handling

All external input is untrusted until validated. This includes user input, API responses, file contents, environment variables, and query parameters.

- **Validate at boundaries.** Check structure, type, and constraints at entry points—not deep in business logic.
- **Whitelist over blacklist.** Define what's allowed; reject everything else. Blacklists miss edge cases.
- **Sanitize at output.** Validate structure early; encode/escape at the point of use (HTML, SQL, shell, URL).
- **Never trust client-side validation.** It's for UX, not security. Re-validate on the server.

### Injection Prevention

- **Use parameterized queries.** Never concatenate user input into SQL, NoSQL, or LDAP queries. Use prepared statements or ORM methods that handle escaping.
- **Escape shell arguments.** Never pass user input directly to shell commands. Use argument arrays or established escaping functions.
- **Context-aware encoding.** HTML, JavaScript, CSS, and URL contexts require different escaping rules. Use established libraries.

### Authentication and Authorization

- **Fail closed.** Default to denial; require explicit permission. Errors should not grant access.
- **Verify on every request.** Don't assume a request is authorized because it reached a handler.

### Secrets and Credentials

- **Never hardcode secrets.** Use environment variables, secret managers, or encrypted stores. Secrets in source control are compromised secrets.
- **Don't log sensitive data.** Credentials, tokens, API keys, and PII should never appear in logs. Mask or redact before logging.

### Data Protection

- **Hash passwords properly.** Use bcrypt, scrypt, or Argon2 with appropriate work factors. Never MD5, SHA1, or plain SHA-256.

### Error Handling

- **Don't leak internals.** Stack traces, database errors, and file paths should not reach users. Log details internally; return generic messages externally.
- **Handle errors explicitly.** Catch blocks should do something—log, recover, or re-raise. Silent swallowing hides problems.

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

## Validation Before Finishing

Before declaring work complete, run the full validation suite to catch issues that
pre-commit hooks don't check (tests, complexity, type checking). Pre-commit hooks
are fast guardrails for every commit; validation is the comprehensive check before
handoff.

### When to Validate

Run validation when:

- Completing a task or PR
- Handing off to human review
- Making significant changes that could affect tests or complexity

### How to Validate

Check if the project has a validation command:

```bash
# Check for project-specific validation
cat Makefile 2>/dev/null | grep -E "^(validate|check|test-all)"
cat package.json 2>/dev/null | jq -r '.scripts | keys[]' 2>/dev/null | grep -E "(validate|check)"
```

If no project-specific command exists, run pre-commit on all files:

```bash
pre-commit run --all-files
```

### What Validation Catches

| Check | Why It Matters |
|-------|----------------|
| Tests | Ensures changes don't break existing functionality |
| Cyclomatic complexity | Prevents unmaintainable code |
| Type checking | Full project type safety (not just changed files) |

**Note:** Dependency audits, SAST, and license compliance run in CI, not locally. These checks are triggered by lockfile changes or run on a schedule.

### Validation Failures

If validation fails:

1.  Fix the issues immediately
2.  Amend the commit or make a new commit with fixes
3.  Re-run validation to confirm

Do not declare work complete with failing validation.

## Cross-Cutting Rules

These apply everywhere, regardless of language:

- Comment _why_, not _what_. Code explains what; comments explain intent and non-obvious decisions.
- Prefer explicit over implicit — if intent or type is unclear at a glance, make it explicit.
- Keep functions small and single-purpose.
- Never introduce a dependency without a clear reason. Note the purpose when you do.
- Do not leave debug logs, dead code, or TODOs without a corresponding explanation.
