import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smart-people';
import { selectVisiblePeople } from '../lib/select-visible';
import { DEFAULT_FILTERS, type Pioneer, type SortKey } from '../types';
import { FilterControls } from './FilterControls';

export interface ScientistDirectoryProps {
  readonly initialData?: readonly Pioneer[];
}

export function ScientistDirectory({ initialData = SMART_PEOPLE }: ScientistDirectoryProps) {
  const headingId = useId();
  // Single source of truth: only independent inputs are state.
  const [people] = useState(initialData);
  const [query, setQuery] = useState(DEFAULT_FILTERS.query);
  const [minIq, setMinIq] = useState(DEFAULT_FILTERS.minIq);
  const [sortBy, setSortBy] = useState<SortKey>(DEFAULT_FILTERS.sortBy);

  // Derived during render: one pass per keystroke, no filteredPeople state, no effect.
  const visible = selectVisiblePeople(people, { query, minIq, sortBy });

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Directory</h2>
      <FilterControls
        query={query}
        minIq={minIq}
        sortBy={sortBy}
        onQueryChange={setQuery}
        onMinIqChange={setMinIq}
        onSortChange={setSortBy}
      />
      <ul aria-label="Pioneers">
        {visible.map((person) => (
          <li key={person.id}>
            <article aria-labelledby={`${headingId}-${person.id}`}>
              <h3 id={`${headingId}-${person.id}`}>{person.name}</h3>
              <dl>
                <dt>Age</dt>
                <dd>{person.age}</dd>
                <dt>IQ</dt>
                <dd>{person.iq}</dd>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
