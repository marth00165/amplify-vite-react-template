import { describe, expect, it } from 'vitest';
import {
  formatDate,
  parseFoodChallengeDate,
  toLocalDateInputValue,
} from './foodChallengeUtils';

describe('foodChallenge date helpers', () => {
  it('parses date-only strings as local calendar dates', () => {
    const parsedDate = parseFoodChallengeDate('2026-03-12');

    expect(parsedDate.getFullYear()).toBe(2026);
    expect(parsedDate.getMonth()).toBe(2);
    expect(parsedDate.getDate()).toBe(12);
  });

  it('returns local YYYY-MM-DD values without UTC shifting', () => {
    const localDate = new Date(2026, 2, 12, 23, 15);

    expect(toLocalDateInputValue(localDate)).toBe('2026-03-12');
  });

  it('formats date-only values without drifting to the prior day', () => {
    expect(formatDate('2026-03-12')).toBe('Mar 12, 2026');
  });
});
