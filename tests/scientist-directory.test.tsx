import { readFileSync } from 'node:fs';
import { Profiler } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ScientistDirectory } from '../src/components/ScientistDirectory';
import { SMART_PEOPLE } from '../src/data/smart-people';

const rowNames = (): string[] =>
  within(screen.getByRole('list', { name: 'Pioneers' }))
    .queryAllByRole('heading', { level: 3 })
    .map((h) => h.textContent ?? '');

const allData = { initialData: SMART_PEOPLE };

describe('ScientistDirectory: rendering', () => {
  it('renders a labelled section with one article per pioneer at the default filter', () => {
    render(<ScientistDirectory {...allData} />);
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

describe('ScientistDirectory: accessible filter form', () => {
  it('labels every control through useId', () => {
    render(<ScientistDirectory {...allData} />);
    const form = screen.getByRole('search', { name: 'Filter pioneers' });
    for (const control of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')) {
      expect(control.id).not.toBe('');
      expect(control.labels?.[0]?.htmlFor).toBe(control.id);
    }
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Minimum IQ')).toBeDefined();
    expect(screen.getByLabelText('Sort by')).toBeDefined();
  });

  it('does not submit the form on Enter', () => {
    render(<ScientistDirectory {...allData} />);
    const event = new Event('submit', { bubbles: true, cancelable: true });
    screen.getByRole('search').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('ScientistDirectory: derived pipeline', () => {
  it('filters by name as the user types', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'NEW' } });
    expect(rowNames()).toEqual(['Isaac Newton']);
  });

  it('filters by minimum IQ as a number', () => {
    render(<ScientistDirectory {...allData} />);
    const iq = screen.getByLabelText<HTMLInputElement>('Minimum IQ');
    fireEvent.change(iq, { target: { value: '200' } });
    expect(rowNames()).toEqual(['Johann Goethe', 'Albert Einstein', 'William Sidis']);
    // '35' + 1 === '351' bug: the value must stay numeric, so 1000 filters everything out.
    fireEvent.change(iq, { target: { value: '1000' } });
    expect(rowNames()).toEqual([]);
  });

  it('treats an empty IQ field as 0 instead of NaN', () => {
    render(<ScientistDirectory {...allData} />);
    const iq = screen.getByLabelText<HTMLInputElement>('Minimum IQ');
    fireEvent.change(iq, { target: { value: '' } });
    expect(iq.value).toBe('0');
    expect(rowNames()).toHaveLength(SMART_PEOPLE.length);
  });

  it('re-sorts with the selected key', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'age-asc' } });
    expect(rowNames()[0]).toBe('William Sidis');
  });

  it('commits exactly once per keystroke (no effect cascade)', () => {
    const onRender = vi.fn();
    render(
      <Profiler id="directory" onRender={onRender}>
        <ScientistDirectory {...allData} />
      </Profiler>,
    );
    onRender.mockClear();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'a' } });
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(onRender.mock.calls[0]?.[1]).toBe('update');
  });

  it('keeps the same DOM node for a row when the list re-sorts (stable keys)', () => {
    render(<ScientistDirectory {...allData} />);
    const goethe = screen.getByRole('article', { name: 'Johann Goethe' });
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'name-asc' } });
    expect(screen.getByRole('article', { name: 'Johann Goethe' })).toBe(goethe);
  });
});

describe('Checkpoint 2: source rules', () => {
  const sources = ['src/components/ScientistDirectory.tsx', 'src/components/FilterControls.tsx', 'src/lib/select-visible.ts'];

  it.each(sources)('%s uses no useEffect and no mutating sort', (file) => {
    const source = readFileSync(file, 'utf8');
    expect(source).not.toMatch(/useEffect/);
    expect(source).not.toMatch(/\.sort\(/);
  });
});
