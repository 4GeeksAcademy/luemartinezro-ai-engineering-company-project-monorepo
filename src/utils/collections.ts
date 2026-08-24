/**
 * HealthCore — Collection Management Utilities
 *
 * Functions to filter, sort, search, and group elements within arrays.
 * All functions have explicit types and follow the single-responsibility principle.
 *
 * @package @repo/shared-types
 */

// ──────────────────────────────────────────────
// Filtering Functions
// ──────────────────────────────────────────────

/**
 * Filter an array by a single predicate function.
 * Returns an empty array if no elements match.
 */
export function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

/**
 * Filter an array by multiple criteria.
 * Each criterion is a predicate; ALL must match (AND logic).
 * Returns an empty array if no elements match all criteria.
 */
export function filterByAll<T>(items: T[], predicates: Array<(item: T) => boolean>): T[] {
  return items.filter((item) => predicates.every((pred) => pred(item)));
}

/**
 * Filter an array by a specific property value.
 * Returns an empty array if no elements match.
 */
export function filterByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
  value: T[K],
): T[] {
  return items.filter((item) => item[property] === value);
}

/**
 * Filter an array by a numeric range on a given property (inclusive).
 * Returns an empty array if no elements fall within the range.
 */
export function filterByRange<T>(
  items: T[],
  property: keyof T,
  min: number,
  max: number,
): T[] {
  return items.filter((item) => {
    const val = item[property];
    if (typeof val !== 'number') return false;
    return val >= min && val <= max;
  });
}

/**
 * Filter an array by a set of allowed values for a property.
 * Returns an empty array if no elements match.
 */
export function filterByValues<T, K extends keyof T>(
  items: T[],
  property: K,
  allowedValues: T[K][],
): T[] {
  const allowedSet = new Set(allowedValues);
  return items.filter((item) => allowedSet.has(item[property]));
}

// ──────────────────────────────────────────────
// Sorting Functions
// ──────────────────────────────────────────────

/** Sort direction for sorting operations */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort an array by a single property.
 * Works with string, number, and date-comparable values.
 * Returns a NEW sorted array (does not mutate the original).
 */
export function sortBy<T, K extends keyof T>(
  items: T[],
  property: K,
  direction: SortDirection = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const valA = a[property];
    const valB = b[property];

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Sort an array by multiple properties (priority order).
 * Each entry specifies the property and direction.
 * Returns a NEW sorted array.
 */
export function sortByMultiple<T>(
  items: T[],
  criteria: Array<{ property: keyof T; direction: SortDirection }>,
): T[] {
  return [...items].sort((a, b) => {
    for (const { property, direction } of criteria) {
      const valA = a[property];
      const valB = b[property];

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Sort an array using a custom comparator function.
 * Returns a NEW sorted array.
 */
export function sortByComparator<T>(
  items: T[],
  comparator: (a: T, b: T) => number,
): T[] {
  return [...items].sort(comparator);
}

// ──────────────────────────────────────────────
// Grouping Functions
// ──────────────────────────────────────────────

/**
 * Group elements by a specific property value.
 * Returns a Map where keys are the property values and values are arrays of items.
 */
export function groupBy<T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keySelector(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/**
 * Group elements by a specific property and return an array of group entries.
 * Useful when you need to iterate over groups in order.
 */
export function groupByEntries<T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Array<{ key: K; items: T[] }> {
  const map = groupBy(items, keySelector);
  return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
}

// ──────────────────────────────────────────────
// Collection Utility Functions
// ──────────────────────────────────────────────

/**
 * Get unique values of a specific property from an array.
 */
export function uniqueValues<T, K extends keyof T>(items: T[], property: K): T[K][] {
  const seen = new Set<T[K]>();
  for (const item of items) {
    seen.add(item[property]);
  }
  return Array.from(seen);
}

/**
 * Check if an array is empty.
 */
export function isEmpty<T>(items: T[]): boolean {
  return items.length === 0;
}

/**
 * Get a paginated slice of an array.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Count occurrences of each distinct value of a property.
 */
export function countBy<T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Map<K, number> {
  const counts = new Map<K, number>();
  for (const item of items) {
    const key = keySelector(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}