import type { DirectoryFilters, Pioneer, SortKey } from '../types';

/** Lower-case and strip diacritics, so "da vinci" matches "Da Vinci" and "goethe" matches "Göthe". */
export function foldText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

const byName = (a: Pioneer, b: Pioneer): number => a.name.localeCompare(b.name, 'en');

/** Comparators for every sort key. Ties fall back to name so equal IQs never swap places between renders. */
export const COMPARATORS: Readonly<Record<SortKey, (a: Pioneer, b: Pioneer) => number>> = {
  'iq-desc': (a, b) => b.iq - a.iq || byName(a, b),
  'iq-asc': (a, b) => a.iq - b.iq || byName(a, b),
  'age-asc': (a, b) => a.age - b.age || byName(a, b),
  'age-desc': (a, b) => b.age - a.age || byName(a, b),
  'name-asc': byName,
};

/**
 * Pure derived-state pipeline, run during render: filter by name and minimum IQ, then sort with the
 * non-mutating ES2023 `.toSorted()`. The input array is never touched.
 */
export function selectVisiblePeople(people: readonly Pioneer[], { query, minIq, sortBy }: DirectoryFilters): Pioneer[] {
  const needle = foldText(query);
  return people
    .filter((person) => person.iq >= minIq && foldText(person.name).includes(needle))
    .toSorted(COMPARATORS[sortBy]);
}

/** `valueAsNumber` is NaN for an empty or partial number input; treat that as "no minimum". */
export function readNumberInput(input: HTMLInputElement): number {
  const value = input.valueAsNumber;
  return Number.isNaN(value) ? 0 : value;
}
