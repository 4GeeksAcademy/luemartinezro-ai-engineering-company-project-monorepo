/**
 * HealthCore — Transformations & Aggregations
 *
 * Functions that take collections of objects and generate reports:
 * count elements by category, sum numeric values, find max/min, calculate averages.
 * Everything is fully typed and follows the single-responsibility principle.
 *
 * @package @repo/shared-types
 */

import { CategoryCount, NumericSummary } from '../types/models';

// ──────────────────────────────────────────────
// Counting & Categorization
// ──────────────────────────────────────────────

/**
 * Count how many elements exist for each distinct value of a given property.
 * Returns an array of { category, count } objects.
 */
export function countByCategory<T, K extends keyof T>(
  items: T[],
  categorySelector: (item: T) => string,
): CategoryCount[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const category = categorySelector(item);
    map.set(category, (map.get(category) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Count elements by a specific property value.
 */
export function countByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): CategoryCount[] {
  return countByCategory(items, (item) => String(item[property]));
}

// ──────────────────────────────────────────────
// Summation
// ──────────────────────────────────────────────

/**
 * Sum all numeric values extracted from items by a selector function.
 */
export function sum<T>(items: T[], valueSelector: (item: T) => number): number {
  return items.reduce((total, item) => total + valueSelector(item), 0);
}

/**
 * Sum values of a specific numeric property.
 */
export function sumByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): number {
  return sum(items, (item) => {
    const val = item[property];
    return typeof val === 'number' ? val : 0;
  });
}

// ──────────────────────────────────────────────
// Averages
// ──────────────────────────────────────────────

/**
 * Calculate the average (mean) of numeric values from a selector.
 * Returns 0 if the array is empty.
 */
export function average<T>(items: T[], valueSelector: (item: T) => number): number {
  if (items.length === 0) return 0;
  const total = sum(items, valueSelector);
  return total / items.length;
}

/**
 * Calculate the average of a specific numeric property.
 * Returns 0 if the array is empty.
 */
export function averageByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): number {
  if (items.length === 0) return 0;
  const total = sumByProperty(items, property);
  return total / items.length;
}

// ──────────────────────────────────────────────
// Minimum & Maximum
// ──────────────────────────────────────────────

/**
 * Find the minimum numeric value from a selector.
 * Returns undefined if the array is empty.
 */
export function min<T>(items: T[], valueSelector: (item: T) => number): number | undefined {
  if (items.length === 0) return undefined;
  let minValue = valueSelector(items[0]);
  for (let i = 1; i < items.length; i++) {
    const val = valueSelector(items[i]);
    if (val < minValue) minValue = val;
  }
  return minValue;
}

/**
 * Find the minimum value of a specific numeric property.
 * Returns undefined if the array is empty.
 */
export function minByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): number | undefined {
  return min(items, (item) => {
    const val = item[property];
    return typeof val === 'number' ? val : 0;
  });
}

/**
 * Find the maximum numeric value from a selector.
 * Returns undefined if the array is empty.
 */
export function max<T>(items: T[], valueSelector: (item: T) => number): number | undefined {
  if (items.length === 0) return undefined;
  let maxValue = valueSelector(items[0]);
  for (let i = 1; i < items.length; i++) {
    const val = valueSelector(items[i]);
    if (val > maxValue) maxValue = val;
  }
  return maxValue;
}

/**
 * Find the maximum value of a specific numeric property.
 * Returns undefined if the array is empty.
 */
export function maxByProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): number | undefined {
  return max(items, (item) => {
    const val = item[property];
    return typeof val === 'number' ? val : 0;
  });
}

/**
 * Find the item with the minimum numeric value from a selector.
 * Returns undefined if the array is empty.
 */
export function minBy<T>(
  items: T[],
  valueSelector: (item: T) => number,
): T | undefined {
  if (items.length === 0) return undefined;
  let minItem = items[0];
  let minValue = valueSelector(minItem);
  for (let i = 1; i < items.length; i++) {
    const val = valueSelector(items[i]);
    if (val < minValue) {
      minValue = val;
      minItem = items[i];
    }
  }
  return minItem;
}

/**
 * Find the item with the maximum numeric value from a selector.
 * Returns undefined if the array is empty.
 */
export function maxBy<T>(
  items: T[],
  valueSelector: (item: T) => number,
): T | undefined {
  if (items.length === 0) return undefined;
  let maxItem = items[0];
  let maxValue = valueSelector(maxItem);
  for (let i = 1; i < items.length; i++) {
    const val = valueSelector(items[i]);
    if (val > maxValue) {
      maxValue = val;
      maxItem = items[i];
    }
  }
  return maxItem;
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

/**
 * Generate a full NumericSummary for a given numeric value selector.
 * Includes total, average, min, max, and count.
 */
export function summarizeNumeric<T>(
  items: T[],
  label: string,
  valueSelector: (item: T) => number,
): NumericSummary {
  const count = items.length;
  const total = sum(items, valueSelector);
  const avg = average(items, valueSelector);
  const minVal = min(items, valueSelector) ?? 0;
  const maxVal = max(items, valueSelector) ?? 0;

  return { label, total, average: avg, min: minVal, max: maxVal, count };
}

/**
 * Generate a NumericSummary for a specific numeric property.
 */
export function summarizeProperty<T, K extends keyof T>(
  items: T[],
  label: string,
  property: K,
): NumericSummary {
  return summarizeNumeric(items, label, (item) => {
    const val = item[property];
    return typeof val === 'number' ? val : 0;
  });
}

/**
 * Generate multiple category summaries from an array of items.
 * Groups items by a category key, then generates a NumericSummary per group.
 */
export function summarizeByCategory<T>(
  items: T[],
  categorySelector: (item: T) => string,
  valueSelector: (item: T) => number,
): NumericSummary[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const category = categorySelector(item);
    const group = groups.get(category);
    if (group) {
      group.push(item);
    } else {
      groups.set(category, [item]);
    }
  }

  return Array.from(groups.entries()).map(([category, groupItems]) =>
    summarizeNumeric(groupItems, category, valueSelector),
  );
}

/**
 * Count total elements in an array.
 */
export function count<T>(items: T[]): number {
  return items.length;
}

/**
 * Generate a simple frequency report: for each distinct value of a property,
 * show the count and percentage of total.
 */
export function frequencyReport<T>(
  items: T[],
  labelSelector: (item: T) => string,
): Array<{ label: string; count: number; percentage: number }> {
  const total = items.length;
  if (total === 0) return [];

  const counts = countByCategory(items, labelSelector);
  return counts.map(({ category, count }) => ({
    label: category,
    count,
    percentage: Math.round((count / total) * 100 * 100) / 100, // 2 decimal places
  }));
}