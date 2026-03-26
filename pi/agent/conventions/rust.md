# Rust Coding Conventions

Based on [The Rust Book](https://doc.rust-lang.org/book/), [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/),
and [RFC 430 naming conventions](https://github.com/rust-lang/rfcs/blob/master/text/0430-finalizing-naming-conventions.md).

---

## General Principles

- Prioritize readability, safety, and maintainability above all else.
- Use strong typing and leverage Rust's ownership system — never fight the borrow checker, work with it.
- Break complex functions into smaller focused functions. If a function needs a comment to explain what it does, it should probably be extracted.
- Comment _why_, not _what_. The code explains what; comments explain intent and non-obvious decisions.
- Ensure code compiles without warnings. Treat warnings as errors in CI.

---

## Naming Conventions (RFC 430)

| Item                          | Convention             | Example                   |
| ----------------------------- | ---------------------- | ------------------------- |
| Types, traits, enums          | `UpperCamelCase`       | `UserProfile`, `AppError` |
| Functions, methods, variables | `snake_case`           | `get_user`, `is_valid`    |
| Constants                     | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`             |
| Modules                       | `snake_case`           | `mod auth_handler`        |
| Lifetimes                     | short lowercase        | `'a`, `'db`               |

- Boolean variables and functions should read as assertions: `is_active`, `has_permission`, `can_delete`.
- Avoid abbreviations unless universally understood (`id`, `url`, `db` are fine; `usr`, `cfg` are not).

---

## Error Handling

- Use `Result<T, E>` for all recoverable errors. Never use `unwrap()` or `expect()` in non-test code.
- Use the `?` operator for error propagation — prefer it over explicit `match` unless you need to transform the error.
- Define a project-level error enum (e.g., `AppError`) that implements `IntoResponse` (for web frameworks) so handlers return consistent, structured responses — never raw strings or tuples.
- Require `thiserror` in `Cargo.toml` for deriving error types. Add `anyhow` if you need ad-hoc error context in application code.
- Provide meaningful error messages with enough context to diagnose the problem.
- Validate function arguments at the boundary (handlers, public functions) and return typed errors for invalid input.

```rust
// Good
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("user not found: {id}")]
    NotFound { id: i64 },
    #[error("database error")]
    Database(#[from] sqlx::Error),
}

// Bad
fn get_user(id: i64) -> User {
    db.find(id).unwrap() // panics in production
}
```

---

## Ownership and Borrowing

- Prefer borrowing (`&T`) over cloning. Only clone when ownership transfer is genuinely needed.
- Use `&str` for string parameters; `String` only when you need to own or store the value.
- Prefer zero-copy operations. Avoid unnecessary allocations.
- Use `Arc<T>` for shared state across async tasks (e.g., database pool, config).
- Use `Mutex<T>` or `RwLock<T>` for interior mutability in async/multi-threaded contexts.
- Annotate lifetimes explicitly when the compiler cannot infer them — don't guess.

---

## Async Code

- Use `async/await` throughout. Do not mix blocking and async code without `spawn_blocking`.
- Handlers should be thin: extract business logic into service functions or modules.
- Share application state via dependency injection with an `Arc`-wrapped struct.
- Do not hold locks across `.await` points.

```rust
// Good — thin handler, logic in service layer
async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<User>, AppError> {
    let user = user_service::create(&state.db, payload).await?;
    Ok(Json(user))
}
```

---

## Database (SQLx)

- Use `sqlx::query!` or `sqlx::query_as!` macros for compile-time query verification when possible.
- Never interpolate user input directly into SQL strings — always use bound parameters.
- Keep migrations in `migrations/` with sequential numbered filenames.
- Use transactions for operations that must be atomic.
- Model database rows as plain structs deriving `sqlx::FromRow`.

---

## Type Safety

- Prefer enums over boolean flags or string states. An enum makes invalid states unrepresentable.
- Use newtypes to distinguish values of the same underlying type (e.g., `UserId(i64)` vs raw `i64`).
- Structs should have private fields; expose behaviour through methods, not data.
- Implement `Debug` on all public types. Implement `Clone`, `PartialEq` where semantically meaningful.
- All public types must implement `Debug`.

---

## Code Structure

- Split `main.rs` and `lib.rs`: keep `main.rs` minimal (setup, wiring), move logic to modules.
- Group modules by domain, not by layer (prefer `mod users` over `mod handlers`).
- Use `pub(crate)` to limit visibility within the crate; avoid over-exposing internals as `pub`.
- Use `mod.rs` or named files consistently — don't mix both styles in the same project.

---

## Patterns to Avoid

- No `unwrap()` / `expect()` outside of tests and initialization code.
- No panics in library or handler code — return `Result`.
- No global mutable state — use dependency injection.
- No deeply nested logic — extract to named functions or use combinators.
- No premature `.collect()` — keep iterators lazy until collection is required.
- No `unsafe` unless strictly necessary and fully documented with a `// SAFETY:` comment.
- Do not ignore `clippy` warnings.

---

## Formatting and Tooling

- Run `rustfmt` before committing. Keep lines under 100 characters.
- Run `cargo clippy -- -D warnings` and fix all warnings.
- Document all public items with `///` rustdoc comments. Include an example where the usage isn't obvious.
- Write unit tests in `#[cfg(test)]` modules co-located with the code they test.
- Write integration tests in `tests/` with descriptive filenames.

---

## Quality Checklist

Before submitting code:

- [ ] Naming follows RFC 430 conventions
- [ ] No `unwrap()`/`expect()` outside tests
- [ ] All public items have `///` documentation
- [ ] `cargo fmt`, `cargo clippy`, `cargo test` all pass
- [ ] `Debug` implemented on all public types
- [ ] Errors are typed, meaningful, and propagated with `?`
- [ ] No unnecessary clones or allocations
