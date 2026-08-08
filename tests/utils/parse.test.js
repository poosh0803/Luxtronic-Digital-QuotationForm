const { parseIntOrNull, parseFloatOrNull } = require('../../src/utils/parse');

describe('parseIntOrNull', () => {
  test('returns null for empty string', () => {
    expect(parseIntOrNull('')).toBeNull();
  });

  test('returns null for null', () => {
    expect(parseIntOrNull(null)).toBeNull();
  });

  test('returns null for undefined', () => {
    expect(parseIntOrNull(undefined)).toBeNull();
  });

  test('parses a numeric string to an integer', () => {
    expect(parseIntOrNull('5')).toBe(5);
  });

  test('preserves zero instead of treating it as falsy', () => {
    expect(parseIntOrNull('0')).toBe(0);
  });

  test('truncates decimal strings', () => {
    expect(parseIntOrNull('3.9')).toBe(3);
  });
});

describe('parseFloatOrNull', () => {
  test('returns null for empty string', () => {
    expect(parseFloatOrNull('')).toBeNull();
  });

  test('returns null for null', () => {
    expect(parseFloatOrNull(null)).toBeNull();
  });

  test('returns null for undefined', () => {
    expect(parseFloatOrNull(undefined)).toBeNull();
  });

  test('parses a numeric string to a float', () => {
    expect(parseFloatOrNull('12.5')).toBe(12.5);
  });

  test('preserves zero instead of treating it as falsy', () => {
    expect(parseFloatOrNull('0')).toBe(0);
  });
});
