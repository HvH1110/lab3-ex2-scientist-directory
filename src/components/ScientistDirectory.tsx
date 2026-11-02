import { useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { SMART_PEOPLE } from '../data/smart-people';
import { selectVisiblePeople } from '../lib/select-visible';
import { DEFAULT_FILTERS, type Pioneer, type SortKey } from '../types';
import { FilterControls } from './FilterControls';
import styles from './ScientistDirectory.module.css';

export interface ScientistDirectoryProps {
  readonly initialData?: readonly Pioneer[];
}

export function ScientistDirectory({ initialData = SMART_PEOPLE }: ScientistDirectoryProps) {
  const headingId = useId();
  // Single source of truth: only independent inputs are state.
  const [people, setPeople] = useState(initialData);
  const [query, setQuery] = useState(DEFAULT_FILTERS.query);
  const [minIq, setMinIq] = useState(DEFAULT_FILTERS.minIq);
  const [sortBy, setSortBy] = useState<SortKey>(DEFAULT_FILTERS.sortBy);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const deleteButtons = useRef(new Map<string, HTMLButtonElement>());

  // Derived during render: one pass per keystroke, no filteredPeople state, no effect.
  const visible = selectVisiblePeople(people, { query, minIq, sortBy });
  const deletedCount = initialData.length - people.length;

  const handleDelete = (id: string): void => {
    const index = visible.findIndex((person) => person.id === id);
    const neighbour = visible[index + 1] ?? visible[index - 1];
    // Commit the removal synchronously so the neighbour's button is in the DOM state we focus.
    flushSync(() => setPeople((prev) => prev.filter((person) => person.id !== id)));
    (neighbour ? deleteButtons.current.get(neighbour.id) : headingRef.current)?.focus();
  };

  const handleReset = (): void => {
    flushSync(() => setPeople(initialData));
    // The Reset button disables itself, so hand focus to the section heading instead of <body>.
    headingRef.current?.focus();
  };

  return (
    <section className={styles.directory} aria-labelledby={headingId}>
      <h2 className={styles.heading} id={headingId} ref={headingRef} tabIndex={-1}>
        Pioneer Directory
      </h2>
      <FilterControls
        query={query}
        minIq={minIq}
        sortBy={sortBy}
        onQueryChange={setQuery}
        onMinIqChange={setMinIq}
        onSortChange={setSortBy}
      />
      <p className={styles.toolbar}>
        <output role="status" aria-live="polite">
          Found {visible.length} {visible.length === 1 ? 'pioneer' : 'pioneers'} of {people.length}
        </output>
        <button className={styles.reset} type="button" onClick={handleReset} disabled={deletedCount === 0}>
          Reset list{deletedCount > 0 ? ` (${deletedCount} deleted)` : ''}
        </button>
      </p>
      {visible.length === 0 ? (
        <p className={styles.empty}>No pioneers match these filters.</p>
      ) : (
        <ul className={styles.list} aria-label="Pioneers">
          {visible.map((person) => (
            <li key={person.id}>
              <article className={styles.card} aria-labelledby={`${headingId}-${person.id}`}>
                <h3 id={`${headingId}-${person.id}`}>{person.name}</h3>
                <dl className={styles.stats}>
                  <dt>Age</dt>
                  <dd>{person.age}</dd>
                  <dt>IQ</dt>
                  <dd>{person.iq}</dd>
                </dl>
                <button
                  className={styles.delete}
                  type="button"
                  aria-label={`Delete ${person.name}`}
                  onClick={() => handleDelete(person.id)}
                  ref={(button) => {
                    if (button) deleteButtons.current.set(person.id, button);
                    return () => {
                      deleteButtons.current.delete(person.id);
                    };
                  }}
                >
                  Delete
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
