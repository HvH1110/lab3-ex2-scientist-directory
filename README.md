# Lab 03 · Exercise 2: Interactive Scientist & Pioneer Directory

The static legacy `smartPeople` array (Ex 0.4, 2.2, 3, 4.3) becomes a reactive React 19 directory:
case-insensitive name search, a minimum-IQ filter, IQ/age/name sorting through ES2023 `.toSorted()`, delete & reset,
and a live result count for screen readers. Filtering and sorting are **derived during render** with zero
`useEffect`, so one keystroke is exactly one render.

- Rules: [project-rules.md](project-rules.md)
- Work breakdown: [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md)

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + checkpoint tests (Vitest, jsdom, Testing Library)
npm run typecheck  # tsc --noEmit (strict)
npm run build      # typecheck + production bundle
```

## Data flow

```
 useState (independent inputs only)             derived during render (pure)
 ┌───────────────────────────────┐
 │ people  ◄── delete / reset    │
 │ query   ◄── <input search>    │──► selectVisiblePeople(people, filters) ──► visible ──► <ul> + <output>
 │ minIq   ◄── <input number>    │      filter(name ⊇ query && iq >= minIq)
 │ sortBy  ◄── <select>          │      .toSorted(COMPARATORS[sortBy])
 └───────────────────────────────┘
```

| Anti-pattern (what AI writes by default) | What this repo does |
|------------------------------------------|---------------------|
| `filtered` state synced in `useEffect` → stale render, then a second render per keystroke | `visible` is a `const` computed in the render body. A `<Profiler>` test asserts **1 commit per keystroke** |
| `people.sort(...)` mutates state in place | `.toSorted()` returns a new array; a test checks the input order is unchanged |
| `items.push(x); setItems(items)` → `Object.is` sees no change | `setPeople((prev) => prev.filter((p) => p.id !== id))` |
| `key={i}` or `key={name}` | `key={person.id}` with ids fixed once in `normalizeSmartPeople` (`sp-1` … `sp-6`) |
| `e.target.value` on a number input (`'35' + 1 === '351'`) | `e.target.valueAsNumber`, `NaN` → `0` |
| Orphan `<input>` without a label | `<label htmlFor={id}>` + `useId()` for search, IQ and sort |

## Behaviour details

- **Search** trims, ignores case and strips diacritics (`"da vin"` finds *Leonardo da Vinci*).
- **Sorting** breaks ties by name, so Newton and Maxwell (both IQ 190) never swap places between renders.
- **Delete** is labelled per row (`Delete Albert Einstein`). Focus moves to the next visible row's Delete button,
  the previous one if it was the last row, or the section heading when nothing is left. Focus never falls to `<body>`.
- **Reset list** restores the frozen `SMART_PEOPLE` snapshot, shows how many rows were deleted, is disabled when
  there is nothing to restore, and keeps the current filters.
- **Live status**: `<output role="status" aria-live="polite">Found 5 pioneers of 6</output>`, with singular/plural.
- **Empty state**: "No pioneers match these filters." replaces an empty list.

## Checkpoint 2 audit checklist

1. `npm run dev`, open Chrome DevTools and the React DevTools **Profiler**.
2. Record, type one character in **Name**, stop: exactly **one** commit for `ScientistDirectory`.
3. **Elements**: every `input`/`select` has an `id` matching a `<label for>`. There is no `<div>` in `#root`.
4. **Accessibility pane**: the form is a `search` landmark "Filter pioneers"; the count is a `status` live region.
5. Delete *Johann Goethe* with the keyboard (Tab, Enter): focus lands on *Delete Albert Einstein*; the other
   cards keep their DOM nodes (right-click → *Store as global variable* before and after, compare with `===`).
6. Clear **Minimum IQ**: the filter becomes 0 and every pioneer shows, never a `NaN` comparison.
7. **Device Toolbar → iPhone SE (375px)**: no horizontal scroll.
8. `grep -nE "useEffect|\.sort\(" src/components src/lib -r` → no output (also a unit test).

## Structure

| File | Responsibility |
|------|----------------|
| `src/types.ts` | Contracts: `Pioneer`, `SortKey`, `SORT_OPTIONS`, `DirectoryFilters`, `DEFAULT_FILTERS` |
| `src/data/smart-people.ts` | Raw legacy array, `isRawPioneer` validation, `normalizeSmartPeople` (stable ids), frozen snapshot |
| `src/lib/select-visible.ts` | Pure pipeline: `foldText`, `COMPARATORS`, `selectVisiblePeople`, `readNumberInput` |
| `src/components/FilterControls.tsx` | Controlled `role="search"` form with `useId` labels |
| `src/components/ScientistDirectory.tsx` | State owner: derived list, delete with focus hand-off, reset, live status |
| `src/components/*.module.css`, `src/styles.css` | CSS Modules and theme tokens |

## Commit history

Each task in `TASK_DECOMPOSITION.md` is one Conventional Commit, including the three mandatory ones:
`feat(ex2): normalize smartPeople schema with stable IDs`, `feat(ex2): add search, IQ filter & toSorted` and
`feat(ex2): add delete/reset & live status`.
