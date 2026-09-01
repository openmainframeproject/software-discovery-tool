import { buildDistroBitMap, getTables, stringifyBigInts } from '../utils.js';
import { SUPPORTED_DISTROS } from '../config.js';

describe('buildDistroBitMap', () => {
  test('assigns sequential powers of two to each distro version', () => {
    const sampleDistros = {
      Alpha: { 'Alpha 1': 'alpha_1', 'Alpha 2': 'alpha_2' },
      Beta: { 'Beta 1': 'beta_1' }
    };

    const bitMap = buildDistroBitMap(sampleDistros);

    expect(bitMap.Alpha['Alpha 1']).toBe(1n);
    expect(bitMap.Alpha['Alpha 2']).toBe(2n);
    expect(bitMap.Beta['Beta 1']).toBe(4n);
  });

  test('includes configured distros from distros.json', () => {
    const bitMap = buildDistroBitMap(SUPPORTED_DISTROS);

    expect(bitMap).toHaveProperty('Fedora');
    expect(Object.keys(bitMap.Fedora).length).toBeGreaterThan(0);
  });
});

describe('getTables', () => {
  const sampleDistros = {
    Alpha: { 'Alpha 1': 'alpha_1', 'Alpha 2': 'alpha_2' },
    Beta: { 'Beta 1': 'beta_1' }
  };
  const bitMap = buildDistroBitMap(sampleDistros);

  test('returns all tables when all bits are set', () => {
    const tables = getTables('7', bitMap, sampleDistros);
    expect(tables).toEqual(['alpha_1', 'alpha_2', 'beta_1']);
  });

  test('returns only tables matching the search bitmask', () => {
    const tables = getTables('2', bitMap, sampleDistros);
    expect(tables).toEqual(['alpha_2']);
  });

  test('returns an empty list when no bits match', () => {
    const tables = getTables('0', bitMap, sampleDistros);
    expect(tables).toEqual([]);
  });
});

describe('stringifyBigInts', () => {
  test('converts BigInt values to strings', () => {
    const result = stringifyBigInts({ flag: 42n, nested: { value: 7n } });
    expect(result).toEqual({ flag: '42', nested: { value: '7' } });
  });

  test('leaves non-BigInt values unchanged', () => {
    const result = stringifyBigInts({ name: 'Fedora', count: 3 });
    expect(result).toEqual({ name: 'Fedora', count: 3 });
  });
});
