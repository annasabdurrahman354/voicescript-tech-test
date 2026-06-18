/**
 * Coerces value to a string.
 */
export function getString(val: any): string {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  return String(val);
}

/**
 * Coerces value to a base-10 integer.
 */
export function getInt(val: any): number {
  if (typeof val === 'number') {
    return Math.floor(val);
  }
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
