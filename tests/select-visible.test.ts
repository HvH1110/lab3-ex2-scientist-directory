import { SMART_PEOPLE } from '../src/data/smart-people';
import { foldText, readNumberInput, selectVisiblePeople } from '../src/lib/select-visible';
import { DEFAULT_FILTERS, type DirectoryFilters } from '../src/types';

const names = (filters: Partial<DirectoryFilters>): string[] =>
  selectVisiblePeople(SMART_PEOPLE, { ...DEFAULT_FILTERS, ...filters }).map((p) => p.name);

describe('selectVisiblePeople', () => {
  it('defaults to IQ >= 160 sorted by IQ, highest first, ties by name', () => {
    expect(names({})).toEqual([
      'Johann Goethe',
      'Albert Einstein',
      'William Sidis',
      'Isaac Newton',
      'James Maxwell',
      'Leonardo da Vinci',
    ]);
  });

  it('searches names case-insensitively and ignores surrounding spaces', () => {
    expect(names({ query: '  EINSTEIN ' })).toEqual(['Albert Einstein']);
    expect(names({ query: 'da vin' })).toEqual(['Leonardo da Vinci']);
  });

  it('ignores diacritics in both the query and the name', () => {
    const people = [{ id: 'g', name: 'Göthe', age: 82, iq: 210 }];
    expect(selectVisiblePeople(people, { ...DEFAULT_FILTERS, query: 'gothe' })).toHaveLength(1);
  });

  it('filters by minimum IQ with numeric comparison', () => {
    expect(names({ minIq: 200 })).toEqual(['Johann Goethe', 'Albert Einstein', 'William Sidis']);
    expect(names({ minIq: 211 })).toEqual([]);
  });

  it('combines search and IQ filter', () => {
    expect(names({ query: 'i', minIq: 200 })).toEqual(['Albert Einstein', 'William Sidis']);
  });

  it.each([
    ['iq-asc', ['Leonardo da Vinci', 'Isaac Newton', 'James Maxwell', 'William Sidis', 'Albert Einstein', 'Johann Goethe']],
    ['age-asc', ['William Sidis', 'James Maxwell', 'Leonardo da Vinci', 'Albert Einstein', 'Johann Goethe', 'Isaac Newton']],
    ['age-desc', ['Isaac Newton', 'Johann Goethe', 'Albert Einstein', 'Leonardo da Vinci', 'James Maxwell', 'William Sidis']],
    ['name-asc', ['Albert Einstein', 'Isaac Newton', 'James Maxwell', 'Johann Goethe', 'Leonardo da Vinci', 'William Sidis']],
  ] as const)('sorts by %s', (sortBy, expected) => {
    expect(names({ sortBy })).toEqual(expected);
  });

  it('never mutates the input (toSorted, not sort)', () => {
    const input = [...SMART_PEOPLE];
    const before = input.map((p) => p.id);
    const output = selectVisiblePeople(input, { ...DEFAULT_FILTERS, minIq: 0, sortBy: 'name-asc' });
    expect(input.map((p) => p.id)).toEqual(before);
    expect(output).not.toBe(input);
  });
});

describe('foldText', () => {
  it('lower-cases, trims and strips diacritics', () => {
    expect(foldText('  Hoàng Vũ ')).toBe('hoang vu');
  });
});

describe('readNumberInput', () => {
  const numberInput = (value: string): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    return input;
  };

  it('reads the numeric value', () => {
    expect(readNumberInput(numberInput('190'))).toBe(190);
  });

  it('falls back to 0 when the field is empty', () => {
    expect(readNumberInput(numberInput(''))).toBe(0);
  });
});
