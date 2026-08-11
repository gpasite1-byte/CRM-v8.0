/**
 * Week Utilities for Dynamic Real-Time Date & Week Calculation
 * GPA Angola CRM (2026–2036+)
 * Connected to Temporal Engine for 10-Year Stability
 */

import {
  WeekBucket,
  parseExcelDate,
  calculateDaysOpen as calcDaysOpenEngine,
  get10YearWeekBuckets,
  mapTo10YearWeekBucket,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
  WEEKDAY_NAMES_PT
} from './temporalEngine';

export type { WeekBucket };

/**
 * Get formatted current date string (e.g. "Quarta-feira, 5 de Agosto de 2026")
 */
export function getCurrentDateFormatted(refDate: Date = new Date()): string {
  const dayName = WEEKDAY_NAMES_PT[refDate.getDay()];
  const dayNum = refDate.getDate();
  const monthName = MONTH_NAMES_FULL[refDate.getMonth()];
  const year = refDate.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
}

/**
 * Get current year and month info
 */
export function getCurrentMonthLabel(refDate: Date = new Date()): string {
  return `${MONTH_NAMES_FULL[refDate.getMonth()]} ${refDate.getFullYear()}`;
}

/**
 * Compute the relative week buckets based on system or reference date (2026–2036)
 */
export function getCurrentWeeks(refDateInput?: Date | string): WeekBucket[] {
  return get10YearWeekBuckets(refDateInput);
}

/**
 * Determine which week bucket a proposal/deal belongs to across 10 years
 */
export function mapDateToWeekBucket(sem?: unknown, dateStr?: string, refDateInput?: Date | string): 'w1' | 'w2' | 'w3' | 'w4' {
  return mapTo10YearWeekBucket(sem, dateStr, refDateInput);
}

/**
 * Helper to parse Excel dates safely
 */
export { parseExcelDate, calcDaysOpenEngine as calculateDaysOpen };
