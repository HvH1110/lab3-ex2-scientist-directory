/** One directory record after normalization. */
export interface Pioneer {
  /** Stable entity id (`sp-1`, ...), the only valid React key for a row. */
  readonly id: string;
  readonly name: string;
  readonly age: number;
  readonly iq: number;
}

export type SortKey = 'iq-desc' | 'iq-asc' | 'age-asc' | 'age-desc' | 'name-asc';

export const SORT_OPTIONS: readonly { readonly value: SortKey; readonly label: string }[] = [
  { value: 'iq-desc', label: 'IQ (highest first)' },
  { value: 'iq-asc', label: 'IQ (lowest first)' },
  { value: 'age-asc', label: 'Age (youngest first)' },
  { value: 'age-desc', label: 'Age (oldest first)' },
  { value: 'name-asc', label: 'Name (A–Z)' },
];

/** The independent inputs the visible list is derived from. None of these is ever derived itself. */
export interface DirectoryFilters {
  readonly query: string;
  readonly minIq: number;
  readonly sortBy: SortKey;
}

export const DEFAULT_FILTERS: DirectoryFilters = { query: '', minIq: 160, sortBy: 'iq-desc' };

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}
