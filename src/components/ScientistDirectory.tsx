import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smart-people';
import type { Pioneer } from '../types';

export interface ScientistDirectoryProps {
  readonly initialData?: readonly Pioneer[];
}

export function ScientistDirectory({ initialData = SMART_PEOPLE }: ScientistDirectoryProps) {
  const headingId = useId();
  const [people] = useState(initialData);

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Directory</h2>
      <ul aria-label="Pioneers">
        {people.map((person) => (
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
