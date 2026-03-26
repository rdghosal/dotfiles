# TypeScript Coding Conventions

Focused on **human readability**, **consistency**, and **type safety**.

---

## General Principles

- Prefer explicit over implicit. If a type, name, or intent is unclear at a glance, make it explicit.
- Comment _why_, not _what_. Readable code explains itself; comments explain intent and trade-offs.
- Write code for the next developer — including yourself six months from now.
- Keep functions small and single-purpose. If you need a comment to explain what a function does, consider renaming or extracting it.
- **Cyclomatic complexity matters.** Functions with high cyclomatic complexity (many branches, nested conditionals) are hard to understand, test, and maintain. Aim for CCN ≤ 15. When a function grows complex, extract logic into smaller functions or components — not for performance, but for the human reader who needs to understand and modify it later.

---

## TypeScript: Type Safety

### Strict Mode

`strict: true` is required (already enabled). Never disable it or any of its constituent flags.

### Prefer `unknown` over `any`

Never use `any`. Use `unknown` for truly unknown values and narrow with type guards.

```typescript
// Bad
function parse(data: any) {
  return data.name;
}

// Good
function parse(data: unknown): string {
  if (typeof data === "object" && data !== null && "name" in data) {
    return String((data as { name: unknown }).name);
  }
  throw new Error("Invalid data shape");
}
```

### No Non-Null Assertions

Avoid the `!` non-null assertion operator. Use explicit null checks or optional chaining.

```typescript
// Bad
const name = user!.profile!.name;

// Good
const name = user?.profile?.name ?? "Unknown";
```

### Explicit Return Types on Public Functions

Always annotate return types on exported functions and component props. Inference is fine for internal/private helpers.

```typescript
// Good — intent is clear, catches return shape mistakes early
export function formatDuration(seconds: number): string {
  ...
}
```

### Prefer `interface` for Object Shapes, `type` for Unions and Aliases

```typescript
// Object shapes
interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

// Unions, mapped types, or aliases
type LoadingState = "idle" | "loading" | "success" | "error";
type Nullable<T> = T | null;
```

### Use `readonly` for Immutable Data

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

### Discriminated Unions over Boolean Flags

Model state explicitly — never use multiple booleans that can contradict each other.

```typescript
// Bad
interface RequestState {
  isLoading: boolean;
  isError: boolean;
  data?: User;
}

// Good
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User };
```

### Runtime Validation for External Data

API responses and storage values are `unknown` at runtime. Use [Zod](https://zod.dev) to validate and infer types at the boundary.

Service functions must never cast `response.json()` as a known type. Always parse through a Zod schema first — this is the single most important type safety rule, since the API boundary is where the type system stops protecting you.

```typescript
import { z } from "zod";

// Define the schema alongside the type
const UserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

type User = z.infer<typeof UserSchema>;

// In your API service — always validate
const user = UserSchema.parse(await response.json());

// Never do this
const user = (await response.json()) as User; // unsafe cast, no runtime check
```

---

## Naming Conventions

| Item                     | Convention                               | Example                            |
| ------------------------ | ---------------------------------------- | ---------------------------------- |
| Components               | `PascalCase`                             | `UserProfile`, `AudioPlayer`       |
| Files (components)       | `PascalCase.tsx`                         | `UserProfile.tsx`                  |
| Files (non-component)    | `camelCase.ts`                           | `useAudioStore.ts`, `apiClient.ts` |
| Variables, functions     | `camelCase`                              | `fetchUser`, `isPlaying`           |
| Types, interfaces, enums | `PascalCase`                             | `LoadingState`, `UserProfile`      |
| Constants                | `SCREAMING_SNAKE_CASE`                   | `MAX_RETRIES`, `API_BASE_URL`      |
| Boolean variables        | Prefix with `is`, `has`, `can`, `should` | `isLoading`, `hasError`            |

- Avoid abbreviations unless universally understood (`id`, `url`, `api` are fine; `usr`, `val`, `tmp` are not).
- Event handler props should be prefixed with `on`: `onPress`, `onChangeText`.
- Event handler implementations should be prefixed with `handle`: `handlePress`, `handleChangeText`.

---

## React Components

### Functional Components Only

Always use function declarations, not arrow function assignments, for components. This gives better stack traces.

```typescript
// Good
export function UserCard({ user }: UserCardProps) {
  return <View>...</View>
}

// Avoid
const UserCard = ({ user }: UserCardProps) => <View>...</View>
```

### Explicit Props Interface

Always define a props interface named `<ComponentName>Props`. Never use inline type annotations for props.

```typescript
interface AudioPlayerProps {
  trackId: string
  autoPlay?: boolean
  onComplete?: () => void
}

export function AudioPlayer({ trackId, autoPlay = false, onComplete }: AudioPlayerProps) {
  ...
}
```

### Named Exports for Components

Always use named exports. Never default export components — it makes refactoring and search harder.

**Exception:** Framework route files that require `export default`. This is the only acceptable use of default exports.

```typescript
// Good — non-route component
export function ProfileCard() { ... }

// Good — framework route file requiring default
export default function ProfileScreen() { ... }

// Bad — non-route component
export default function ProfileCard() { ... }
```

### Keep Components Focused

A component should do one thing. Extract logic into custom hooks, extract sub-sections into sub-components. If a component file exceeds ~150 lines, consider splitting it.

---

## Custom Hooks

- Extract all stateful logic and side effects into custom hooks prefixed with `use`.
- A hook should have a single responsibility. Compose small hooks rather than building large ones.
- Return a plain object (not an array) from hooks with multiple values for named destructuring clarity.

```typescript
// Good — clear what each value is
const { user, isLoading, error } = useCurrentUser();

// Avoid for >2 values — positional confusion
const [user, isLoading, error] = useCurrentUser();
```

---

## API Services

- All API calls live in `services/`. Components never call `fetch` directly.
- Service functions are plain async functions, not classes.
- Always type request payloads and response shapes. Use Zod schemas to validate responses.
- Handle errors explicitly — don't let `fetch` silently succeed on 4xx/5xx.

```typescript
// services/userService.ts
export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return UserSchema.parse(await res.json());
}
```

---

## Patterns to Avoid

- No `any` — use `unknown` + type guards.
- No `// @ts-ignore` or `// @ts-expect-error` without an accompanying explanation.
- No non-null assertions (`!`) — use optional chaining and nullish coalescing.
- No default exports for components or utilities (except framework-required routes).
- No business logic in components — extract to hooks or services.
- No inline styles — define styles with `StyleSheet.create` or styled-components at the bottom of the file.

---

## Formatting and Tooling

- Use Prettier for formatting (configure to team preference and commit the config).
- Run `tsc --noEmit` in CI to catch type errors without building.
- Prefer `const` over `let`. Never use `var`.
- Use early returns to reduce nesting — avoid deeply nested conditionals.

---

## Quality Checklist

Before submitting code:

- [ ] No `any`, `!`, `@ts-ignore` without justification
- [ ] All exported functions have explicit return types
- [ ] Component props defined as a named interface
- [ ] External data (API responses, storage) validated with Zod
- [ ] State modelled with discriminated unions where appropriate
- [ ] No business logic inside components
- [ ] `tsc --noEmit` passes with no errors
