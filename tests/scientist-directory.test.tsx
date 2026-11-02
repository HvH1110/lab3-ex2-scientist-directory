import { readFileSync } from 'node:fs';
import { Profiler } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ScientistDirectory } from '../src/components/ScientistDirectory';
import { SMART_PEOPLE } from '../src/data/smart-people';

const rowNames = (): string[] => {
  const list = screen.queryByRole('list', { name: 'Pioneers' });
  return list === null ? [] : within(list).getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '');
};
const status = (): string => screen.getByRole('status').textContent ?? '';
const deleteButton = (name: string): HTMLElement => screen.getByRole('button', { name: `Delete ${name}` });
const resetButton = (): HTMLButtonElement => screen.getByRole<HTMLButtonElement>('button', { name: /^Reset list/ });

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

describe('ScientistDirectory: delete, reset & live status', () => {
  it('announces the result count in a polite live region', () => {
    render(<ScientistDirectory {...allData} />);
    const output = screen.getByRole('status');
    expect(output.tagName).toBe('OUTPUT');
    expect(output.getAttribute('aria-live')).toBe('polite');
    expect(status()).toBe('Found 6 pioneers of 6');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'newton' } });
    expect(status()).toBe('Found 1 pioneer of 6');
  });

  it('shows an empty-state message instead of an empty list', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'zzz' } });
    expect(screen.queryByRole('list', { name: 'Pioneers' })).toBeNull();
    expect(screen.getByText('No pioneers match these filters.')).toBeDefined();
    expect(status()).toBe('Found 0 pioneers of 6');
  });

  it('deletes one row immutably and keeps the other rows mounted', () => {
    render(<ScientistDirectory {...allData} />);
    const einstein = screen.getByRole('article', { name: 'Albert Einstein' });
    fireEvent.click(deleteButton('Johann Goethe'));
    expect(rowNames()).not.toContain('Johann Goethe');
    expect(screen.getByRole('article', { name: 'Albert Einstein' })).toBe(einstein);
    expect(status()).toBe('Found 5 pioneers of 5');
    expect(SMART_PEOPLE).toHaveLength(6);
  });

  it('moves focus to the next row after a delete', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.click(deleteButton('Johann Goethe'));
    expect(document.activeElement).toBe(deleteButton('Albert Einstein'));
  });

  it('moves focus to the previous row when the last row is deleted', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.click(deleteButton('Leonardo da Vinci'));
    expect(document.activeElement).toBe(deleteButton('James Maxwell'));
  });

  it('uses the visible (filtered, sorted) order to pick the neighbour', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Minimum IQ'), { target: { value: '200' } });
    fireEvent.click(deleteButton('Albert Einstein'));
    expect(document.activeElement).toBe(deleteButton('William Sidis'));
  });

  it('moves focus to the heading when the last visible row is deleted', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'newton' } });
    fireEvent.click(deleteButton('Isaac Newton'));
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }));
  });

  it('resets to the original snapshot and reports how many were deleted', () => {
    render(<ScientistDirectory {...allData} />);
    expect(resetButton().disabled).toBe(true);
    fireEvent.click(deleteButton('Johann Goethe'));
    fireEvent.click(deleteButton('Isaac Newton'));
    expect(resetButton().textContent).toBe('Reset list (2 deleted)');
    fireEvent.click(resetButton());
    expect(rowNames()).toHaveLength(6);
    expect(resetButton().disabled).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }));
  });

  it('keeps the filters when the list is reset', () => {
    render(<ScientistDirectory {...allData} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'i' } });
    fireEvent.click(deleteButton('William Sidis'));
    fireEvent.click(resetButton());
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('i');
    expect(rowNames()).toContain('William Sidis');
  });

  it('gives every button an explicit type', () => {
    render(<ScientistDirectory {...allData} />);
    for (const button of screen.getAllByRole('button')) expect(button.getAttribute('type')).toBe('button');
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
