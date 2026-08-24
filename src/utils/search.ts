/**
 * HealthCore — Search Utilities
 *
 * Linear search for unsorted arrays and binary search for sorted arrays.
 * All functions have explicit types and properly handle empty cases and elements not found.
 *
 * @package @repo/shared-types
 */

// ──────────────────────────────────────────────
// Linear Search (for unsorted arrays)
// ──────────────────────────────────────────────

/** Result of a search operation */
export interface SearchResult<T> {
  found: boolean;
  item?: T;
  index: number;
}

/**
 * Linear search: find an element by a predicate in an unsorted array.
 * Returns the first match.
 */
export function linearSearch<T>(
  items: T[],
  predicate: (item: T) => boolean,
): SearchResult<T> {
  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i])) {
      return { found: true, item: items[i], index: i };
    }
  }
  return { found: false, index: -1 };
}

/**
 * Linear search: find all elements matching a predicate in an unsorted array.
 * Returns an array of all matches.
 */
export function linearSearchAll<T>(
  items: T[],
  predicate: (item: T) => boolean,
): T[] {
  return items.filter(predicate);
}

/**
 * Linear search: find an element by exact property value.
 */
export function linearSearchByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
  value: T[K],
): SearchResult<T> {
  return linearSearch(items, (item) => item[property] === value);
}

// ──────────────────────────────────────────────
// Binary Search (for sorted arrays)
// ──────────────────────────────────────────────

/**
 * Binary search: find a number in a sorted numeric array.
 * The array MUST be sorted in ascending order for correct results.
 * Returns the index of the element, or -1 if not found.
 */
export function binarySearchNumber(items: number[], target: number): SearchResult<number> {
  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = items[mid];

    if (midValue === target) {
      return { found: true, item: midValue, index: mid };
    }
    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1 };
}

/**
 * Binary search: find a string in a sorted string array.
 * The array MUST be sorted in ascending lexicographic order for correct results.
 */
export function binarySearchString(items: string[], target: string): SearchResult<string> {
  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = items[mid];

    if (midValue === target) {
      return { found: true, item: midValue, index: mid };
    }
    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1 };
}

/**
 * Generic binary search for sorted arrays with a custom comparator.
 * The comparator must return:
 *   - negative if a < b
 *   - zero if a === b
 *   - positive if a > b
 * The array MUST be sorted according to the same comparator.
 */
export function binarySearch<T>(
  items: T[],
  target: T,
  comparator: (a: T, b: T) => number,
): SearchResult<T> {
  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = comparator(items[mid], target);

    if (comparison === 0) {
      return { found: true, item: items[mid], index: mid };
    }
    if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1 };
}

/**
 * Binary search: find an element by a string property value.
 * The array MUST be pre-sorted by that property in ascending order.
 */
export function binarySearchByProperty<T>(
  items: T[],
  property: keyof T,
  target: string,
): SearchResult<T> {
  const comparator = (a: T, _b: T): number => {
    const valA = String(a[property]);
    const valB = target;
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  };

  // We need to construct a dummy object for the target
  // but since comparator ignores the second arg for the target,
  // we can pass any object.
  return binarySearch(items, {} as T, comparator);
}

/**
 * Binary search: find an element by a numeric property value.
 * The array MUST be pre-sorted by that property in ascending order.
 */
export function binarySearchByNumericProperty<T>(
  items: T[],
  property: keyof T,
  target: number,
): SearchResult<T> {
  const comparator = (a: T, _b: T): number => {
    const valA = Number(a[property]);
    if (valA < target) return -1;
    if (valA > target) return 1;
    return 0;
  };

  return binarySearch(items, {} as T, comparator);
}

// ──────────────────────────────────────────────
// Search helpers
// ──────────────────────────────────────────────

/**
 * Check if an element exists in an array using linear search.
 */
export function exists<T>(items: T[], predicate: (item: T) => boolean): boolean {
  return items.some(predicate);
}

/**
 * Find the index of the first element matching a predicate.
 * Returns -1 if not found.
 */
export function findIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.findIndex(predicate);
}