import { useId } from 'react';
import { readNumberInput } from '../lib/select-visible';
import { SORT_OPTIONS, isSortKey, type DirectoryFilters, type SortKey } from '../types';

export interface FilterControlsProps extends DirectoryFilters {
  readonly onQueryChange: (query: string) => void;
  readonly onMinIqChange: (minIq: number) => void;
  readonly onSortChange: (sortBy: SortKey) => void;
}

/** Controlled search form. It owns no state: every value comes from, and goes back to, the directory. */
export function FilterControls({ query, minIq, sortBy, onQueryChange, onMinIqChange, onSortChange }: FilterControlsProps) {
  const searchId = useId();
  const iqId = useId();
  const sortId = useId();

  return (
    <form role="search" aria-label="Filter pioneers" onSubmit={(e) => e.preventDefault()}>
      <p>
        <label htmlFor={searchId}>Name</label>
        <input
          id={searchId}
          type="search"
          value={query}
          placeholder="e.g. einstein"
          autoComplete="off"
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </p>
      <p>
        <label htmlFor={iqId}>Minimum IQ</label>
        <input
          id={iqId}
          type="number"
          inputMode="numeric"
          min={0}
          max={300}
          step={5}
          value={minIq}
          onChange={(e) => onMinIqChange(readNumberInput(e.target))}
        />
      </p>
      <p>
        <label htmlFor={sortId}>Sort by</label>
        <select
          id={sortId}
          value={sortBy}
          onChange={(e) => {
            if (isSortKey(e.target.value)) onSortChange(e.target.value);
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </p>
    </form>
  );
}
