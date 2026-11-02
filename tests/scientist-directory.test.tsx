import { render, screen, within } from '@testing-library/react';
import { ScientistDirectory } from '../src/components/ScientistDirectory';
import { SMART_PEOPLE } from '../src/data/smart-people';

const rowNames = (): string[] =>
  within(screen.getByRole('list', { name: 'Pioneers' }))
    .queryAllByRole('heading', { level: 3 })
    .map((h) => h.textContent ?? '');

describe('ScientistDirectory: rendering', () => {
  it('renders a labelled section with one article per pioneer', () => {
    render(<ScientistDirectory />);
    expect(screen.getByRole('region', { name: 'Pioneer Directory' })).toBeDefined();
    expect(screen.getAllByRole('article')).toHaveLength(SMART_PEOPLE.length);
  });

  it('renders age and IQ as a description list', () => {
    render(<ScientistDirectory initialData={SMART_PEOPLE.slice(0, 1)} />);
    const article = screen.getByRole('article', { name: 'Johann Goethe' });
    const terms = [...article.querySelectorAll('dt')].map((dt) => `${dt.textContent}=${dt.nextElementSibling?.textContent}`);
    expect(terms).toEqual(['Age=82', 'IQ=210']);
  });

  it('accepts initialData', () => {
    render(<ScientistDirectory initialData={[{ id: 'x', name: 'Ada Lovelace', age: 36, iq: 180 }]} />);
    expect(rowNames()).toEqual(['Ada Lovelace']);
  });
});
