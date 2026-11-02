import { RAW_SMART_PEOPLE, SMART_PEOPLE, isRawPioneer, normalizeSmartPeople } from '../src/data/smart-people';

describe('normalizeSmartPeople', () => {
  it('assigns sp-<n> ids in source order and keeps the fields', () => {
    expect(SMART_PEOPLE.map((p) => p.id)).toEqual(['sp-1', 'sp-2', 'sp-3', 'sp-4', 'sp-5', 'sp-6']);
    expect(SMART_PEOPLE[0]).toEqual({ id: 'sp-1', name: 'Johann Goethe', age: 82, iq: 210 });
  });

  it('produces the same ids on every call (stable across reloads)', () => {
    expect(normalizeSmartPeople(RAW_SMART_PEOPLE)).toEqual(SMART_PEOPLE);
  });

  it('gives duplicate names different ids', () => {
    const twins = normalizeSmartPeople([
      { name: 'Same Name', age: 1, iq: 100 },
      { name: 'Same Name', age: 1, iq: 100 },
    ]);
    expect(twins.map((p) => p.id)).toEqual(['sp-1', 'sp-2']);
  });

  it('trims names', () => {
    expect(normalizeSmartPeople([{ name: '  Ada Lovelace ', age: 36, iq: 180 }])[0]?.name).toBe('Ada Lovelace');
  });

  it('freezes the snapshot and every record', () => {
    expect(Object.isFrozen(SMART_PEOPLE)).toBe(true);
    expect(SMART_PEOPLE.every(Object.isFrozen)).toBe(true);
  });

  it('rejects invalid records with their index', () => {
    expect(() => normalizeSmartPeople([{ name: 'A', age: 1, iq: 1 }, { name: 'B', age: '1', iq: 1 }])).toThrow(
      'index 1',
    );
  });
});

describe('isRawPioneer', () => {
  it.each([
    [null],
    ['Einstein'],
    [{ name: '', age: 1, iq: 1 }],
    [{ name: 'A', age: -1, iq: 1 }],
    [{ name: 'A', age: 1.5, iq: 1 }],
    [{ name: 'A', age: 1, iq: Number.NaN }],
    [{ name: 'A', age: 1 }],
  ])('rejects %j', (value) => {
    expect(isRawPioneer(value)).toBe(false);
  });
});
