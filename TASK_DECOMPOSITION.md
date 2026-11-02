# Work Breakdown Structure (WBS) — Exercise 2

Objective: turn the static legacy `smartPeople` array (Ex 0.4, 2.2, 3, 4.3) into a reactive directory with
case-insensitive name search, a minimum-IQ filter, IQ/age sorting through `.toSorted()`, delete & reset, and a live
result count. Filtering and sorting are derived during render with zero `useEffect`.

> RULE: Never prompt AI with more than one sub-task at a time. One task = one commit.

| # | Task | Verification | Commit |
|---|------|--------------|--------|
| 2.0 | Project rules & WBS | Review | `chore: add project rules and task decomposition` |
| 2.1 | React 19 + Vite + strict TS + Vitest/Testing Library; `createRoot` inside `StrictMode` | `npm test`, `npm run typecheck`, `npm run build` | `chore: scaffold react 19 vite typescript toolchain` |
| 2.2 | Contract: `Pioneer`, `SortKey`, `DirectoryFilters` | `npm run typecheck` | `feat(types): define pioneer and directory filter contracts` |
| 2.3 | Validate the raw `smartPeople` array and give every record a stable id; render the list keyed by id | Unit tests | `feat(ex2): normalize smartPeople schema with stable IDs` |
| 2.4 | Pure `selectVisiblePeople` (search, min IQ, `.toSorted()`), `FilterControls` with `useId` labels and `valueAsNumber` | Unit tests + Profiler (1 render per keystroke) | `feat(ex2): add search, IQ filter & toSorted` |
| 2.5 | Immutable delete with focus hand-off, reset to the snapshot, `<output role="status">` count | Unit tests | `feat(ex2): add delete/reset & live status` |
| 2.6 | CSS Module layout, light/dark, 375px | DevTools Device Toolbar (iPhone SE) | `style(ex2): add responsive 375px directory layout` |
| 2.7 | README with Checkpoint 2 audit checklist | Manual review | `docs: add readme with derived state and profiler checklist` |

## Checklist

- [x] Task 2.0: Write `project-rules.md` and `TASK_DECOMPOSITION.md`
- [ ] Task 2.1: Scaffold React 19 toolchain
- [ ] Task 2.2: Define contracts
- [ ] Task 2.3: Normalize `smartPeople` with stable ids
- [ ] Task 2.4: Add search, IQ filter and `.toSorted()`
- [ ] Task 2.5: Add delete/reset and live status
- [ ] Task 2.6: Add responsive CSS Module
- [ ] Task 2.7: Document Checkpoint 2 audit in README
