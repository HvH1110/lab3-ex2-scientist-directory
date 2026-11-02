# Project Rules — Lab 03 / Exercise 2: Interactive Scientist & Pioneer Directory

These rules are binding for every human or AI contribution to this repository.
A change that violates any rule below must not be committed. Lab 02 rules (immutability, `Object.is` state
checks, stable O(n) reconciliation keys, zero div-soup, XSS prevention) still apply in React 19 terms.

## 1. Workflow (Anti-Monolithic Vibe Coding)

1. **Functional slicing**: work only on tasks listed in `TASK_DECOMPOSITION.md`.
2. **Contract first**: types are written *before* the code that uses them.
3. **Atomic generation**: one sub-task per prompt and one sub-task per commit. Never paste the whole exercise into an AI tool.
4. **Independent verification**: every task is verified (unit test, `npm run typecheck`, React DevTools, `git diff`) before it is committed.
5. Tick the matching checkbox in `TASK_DECOMPOSITION.md` in the same commit that completes the task.

## 2. Git

- Conventional Commits: `type(scope): imperative summary`. Types: `feat`, `fix`, `style`, `test`, `docs`, `chore`, `refactor`.
- Mandatory commit messages (exact text):
  - `feat(ex2): normalize smartPeople schema with stable IDs`
  - `feat(ex2): add search, IQ filter & toSorted`
  - `feat(ex2): add delete/reset & live status`
- `npm test` and `npm run typecheck` must pass before every commit.

## 3. Stack

- React 19 + Vite + TypeScript `strict`; no `any` (use `unknown` + typeguards).
- `createRoot` from `react-dom/client` inside `<StrictMode>`. Named imports only.
- **BANNED:** class components, `ReactDOM.render`, `defaultProps`, `import * as React`, `keyCode`, `window.alert`, `var`.

## 4. State Hygiene (Derived State)

- Only independent inputs live in `useState`: `people`, `query`, `minIq`, `sortBy`.
- The visible list is **computed during render** by a pure function. **BANNED:** a second `filteredPeople`
  state and **any `useEffect` for filtering or sorting** (it causes a stale render plus a second render per keystroke).
- Updates are immutable: `prev.filter(...)`, `[...prev, item]`. **BANNED:** `push`, `splice`, in-place `sort`.
  Sorting uses ES2023 `.toSorted()`.
- Every record has a stable entity id (`sp-1`, ...). Keys are `key={person.id}`, never the index or the name.

## 5. Forms & Accessibility

- Every `<input>` / `<select>` has a `<label htmlFor={id}>` whose id comes from `useId()`.
- The filter form is `<form role="search">` and never submits (`preventDefault`).
- Numeric input is read with `e.target.valueAsNumber`; `NaN` falls back to `0`. Never compare string values.
- Every button has `type="button"` (or `type="submit"` deliberately) and an accessible name that names its row.
- The result count is announced through `<output role="status" aria-live="polite">`.
- Deleting a row keeps keyboard focus on a nearby control, never on `<body>`.

## 6. Semantics & Security

- **BANNED:** `<div>` / `<span>` as structural containers. Use `<section>`, `<form>`, `<ul>`/`<li>`, `<article>`, `<dl>`.
- **BANNED:** `dangerouslySetInnerHTML`, `innerHTML`, `eval`. Search text is only ever rendered as text.

## 7. Styling

- CSS Modules + custom properties, light and dark. No horizontal scroll from 375px to 1440px.
