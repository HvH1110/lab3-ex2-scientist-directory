import type { Pioneer } from '../types';

/**
 * The legacy `smartPeople` array from the 2022 deck (Slide 20): no ids, so the old exercise keyed rows by index
 * or by name. Kept as `unknown` because it is treated like any external payload and validated before use.
 */
export const RAW_SMART_PEOPLE: readonly unknown[] = [
  { name: 'Johann Goethe', age: 82, iq: 210 },
  { name: 'Albert Einstein', age: 76, iq: 205 },
  { name: 'Leonardo da Vinci', age: 67, iq: 180 },
  { name: 'Isaac Newton', age: 84, iq: 190 },
  { name: 'James Maxwell', age: 48, iq: 190 },
  { name: 'William Sidis', age: 46, iq: 200 },
];

interface RawPioneer {
  readonly name: string;
  readonly age: number;
  readonly iq: number;
}

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export function isRawPioneer(value: unknown): value is RawPioneer {
  if (typeof value !== 'object' || value === null) return false;
  const { name, age, iq } = value as Record<string, unknown>;
  return typeof name === 'string' && name.trim() !== '' && isNonNegativeInteger(age) && isNonNegativeInteger(iq);
}

/**
 * Validates every record and assigns `sp-<n>` ids from its position in the source snapshot. The id is fixed
 * once, here, so it survives filtering, sorting and deletion (unlike a render-time index).
 */
export function normalizeSmartPeople(raw: readonly unknown[]): readonly Pioneer[] {
  return Object.freeze(
    raw.map((record, index): Pioneer => {
      if (!isRawPioneer(record)) throw new TypeError(`Invalid smartPeople record at index ${index}`);
      return Object.freeze({ id: `sp-${index + 1}`, name: record.name.trim(), age: record.age, iq: record.iq });
    }),
  );
}

/** Immutable snapshot used as the initial state and as the Reset target. */
export const SMART_PEOPLE: readonly Pioneer[] = normalizeSmartPeople(RAW_SMART_PEOPLE);
