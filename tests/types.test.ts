import { DEFAULT_FILTERS, SORT_OPTIONS, isSortKey } from '../src/types';

describe('SortKey contract', () => {
  it('accepts every listed sort option', () => {
    expect(SORT_OPTIONS.every((option) => isSortKey(option.value))).toBe(true);
  });

  it('rejects unknown keys', () => {
    expect(isSortKey('iq')).toBe(false);
    expect(isSortKey('')).toBe(false);
    expect(isSortKey(null)).toBe(false);
  });

  it('has unique option values', () => {
    expect(new Set(SORT_OPTIONS.map((o) => o.value)).size).toBe(SORT_OPTIONS.length);
  });

  it('defaults to IQ >= 160, highest first, no query', () => {
    expect(DEFAULT_FILTERS).toEqual({ query: '', minIq: 160, sortBy: 'iq-desc' });
  });
});
