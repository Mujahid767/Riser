/**
 * Riser dress length chart: age → dress length in inches.
 * Dress "size" numbers (16, 18, … 38) are the length in inches.
 */
export type MeasurementRow = { age: number; length: number };

export const DRESS_MEASUREMENTS: MeasurementRow[] = [
  { age: 1, length: 16 },
  { age: 2, length: 18 },
  { age: 3, length: 20 },
  { age: 4, length: 22 },
  { age: 5, length: 24 },
  { age: 6, length: 26 },
  { age: 7, length: 28 },
  { age: 8, length: 30 },
  { age: 9, length: 32 },
  { age: 10, length: 34 },
  { age: 11, length: 36 },
  { age: 12, length: 38 },
];

/** Parse "22", "22-26", "22–26", "22 to 26" into [min, max]; null if not a length size. */
function parseLengthSize(size: string): [number, number] | null {
  const m = size.trim().match(/^(\d{2})(?:\s*(?:-|–|—|to)\s*(\d{2}))?(?:\s*(?:inch|in|"))?$/i);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return a <= b ? [a, b] : [b, a];
}

/**
 * Rows of the chart covered by a product's sizes.
 * e.g. sizes ["22-26","28-32"] → ages 4–9 (lengths 22–32).
 */
export function getMeasurementsForSizes(sizes: string[] | undefined): MeasurementRow[] {
  if (!sizes?.length) return [];
  const ranges = sizes.map(parseLengthSize).filter((r): r is [number, number] => r !== null);
  if (ranges.length === 0) return [];
  return DRESS_MEASUREMENTS.filter((row) =>
    ranges.some(([lo, hi]) => row.length >= lo && row.length <= hi)
  );
}
