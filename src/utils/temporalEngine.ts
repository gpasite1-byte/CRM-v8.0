/**
 * Temporal Engine - 10-Year Dynamic Calendar & Date Parser (2026–2036+)
 * GPA Angola CRM v8.0 PRO
 */

export interface WeekBucket {
  id: 'w1' | 'w2' | 'w3' | 'w4' | 'w5';
  label: string;
  isCurrent: boolean;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
}

export const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
export const WEEKDAY_NAMES_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

/**
 * Universal Parser for Excel Serial Dates, ISO strings, PT formatted strings (DD/MM/YYYY)
 */
export function parseExcelDate(rawVal: any): { date: Date | null; iso: string; pt: string } {
  if (rawVal === null || rawVal === undefined || rawVal === '') {
    return { date: null, iso: '', pt: '' };
  }

  // Handle JS Date object directly
  if (rawVal instanceof Date) {
    if (isNaN(rawVal.getTime())) return { date: null, iso: '', pt: '' };
    return formatParsedDate(rawVal);
  }

  // Handle Excel serial date numbers (e.g. 45480 = 2026-07-09)
  if (typeof rawVal === 'number' || (!isNaN(Number(rawVal)) && !String(rawVal).includes('/') && !String(rawVal).includes('-'))) {
    const num = Number(rawVal);
    if (num > 10000 && num < 100000) {
      // Excel epoch starts Jan 1 1900 (with Lotus 1-2-3 leap year bug adjustment)
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const parsedDate = new Date(excelEpoch.getTime() + num * 86400000);
      return formatParsedDate(parsedDate);
    }
  }

  const str = String(rawVal).trim();

  // Try DD/MM/YYYY or DD-MM-YYYY
  const ptMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ptMatch) {
    const day = parseInt(ptMatch[1], 10);
    const month = parseInt(ptMatch[2], 10) - 1;
    const year = parseInt(ptMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return formatParsedDate(d);
  }

  // Try YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return formatParsedDate(d);
  }

  // Fallback to standard JS Date parsing
  const nativeParsed = new Date(str);
  if (!isNaN(nativeParsed.getTime())) {
    return formatParsedDate(nativeParsed);
  }

  return { date: null, iso: '', pt: str };
}

function formatParsedDate(d: Date): { date: Date; iso: string; pt: string } {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return {
    date: d,
    iso: `${yyyy}-${mm}-${dd}`,
    pt: `${dd}/${mm}/${yyyy}`
  };
}

/**
 * Calculates exact days open dynamically based on reference date
 */
export function calculateDaysOpen(dataEnvioStr?: string, refDateVal: Date | string = new Date()): number {
  if (!dataEnvioStr) return 0;
  const parsedEnvio = parseExcelDate(dataEnvioStr);
  if (!parsedEnvio.date) return 0;

  const refParsed = parseExcelDate(refDateVal);
  const refDate = refParsed.date || new Date();

  const diffMs = refDate.getTime() - parsedEnvio.date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

/**
 * Gets dynamic week buckets for ANY reference date between 2026 and 2036
 */
export function get10YearWeekBuckets(refDateInput: Date | string = new Date()): WeekBucket[] {
  const parsed = parseExcelDate(refDateInput);
  const refDate = parsed.date || new Date();

  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  // Find Monday of the current week containing refDate
  const currentDayOfWeek = refDate.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = (currentDayOfWeek + 6) % 7;
  const currentWeekMonday = new Date(year, month, day - distanceToMon);

  // Generate 4 consecutive rolling weeks:
  // Week 1: 2 weeks ago
  // Week 2: Last week (Semana Finda)
  // Week 3: Current week (Esta Semana)
  // Week 4: Next week (Próxima Semana)

  const w1Start = new Date(currentWeekMonday);
  w1Start.setDate(w1Start.getDate() - 14);

  const w2Start = new Date(currentWeekMonday);
  w2Start.setDate(w2Start.getDate() - 7);

  const w3Start = new Date(currentWeekMonday);

  const w4Start = new Date(currentWeekMonday);
  w4Start.setDate(w4Start.getDate() + 7);

  const createBucket = (id: 'w1' | 'w2' | 'w3' | 'w4', startDate: Date, isCurrent: boolean): WeekBucket => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // Friday of work week (Mon to Fri)

    const sDay = String(startDate.getDate()).padStart(2, '0');
    const eDay = String(endDate.getDate()).padStart(2, '0');
    const sMonth = MONTH_NAMES_SHORT[startDate.getMonth()];
    const eMonth = MONTH_NAMES_SHORT[endDate.getMonth()];

    let label = '';
    if (sMonth === eMonth) {
      label = `${sDay}–${eDay} ${sMonth} ${startDate.getFullYear()}`;
    } else {
      label = `${sDay} ${sMonth} – ${eDay} ${eMonth} ${startDate.getFullYear()}`;
    }

    return {
      id,
      label,
      isCurrent,
      startDate,
      endDate,
      weekNumber: getISOWeekNumber(startDate)
    };
  };

  return [
    createBucket('w1', w1Start, false),
    createBucket('w2', w2Start, false),
    createBucket('w3', w3Start, true),
    createBucket('w4', w4Start, false)
  ];
}

/**
 * Returns ISO week number for accurate 10-year tracking
 */
export function getISOWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
}

/**
 * Map date or week label to exact week bucket ID
 */
export function mapTo10YearWeekBucket(sem?: unknown, dateStr?: string, refDateInput?: Date | string): 'w1' | 'w2' | 'w3' | 'w4' {
  const buckets = get10YearWeekBuckets(refDateInput || new Date());
  const currentBucket = buckets.find(b => b.isCurrent) || buckets[2];

  const semStr = sem != null ? String(sem).trim() : '';

  if (semStr === 'Semana Anterior') return buckets[0].id;
  if (semStr === 'Semana Finda' || semStr === 'Semana Passada') return buckets[1].id;
  if (semStr === 'Esta Semana' || semStr === 'Semana Atual' || semStr === 'Semana Em Curso') return currentBucket.id;

  if (semStr) {
    for (const b of buckets) {
      if (semStr.toLowerCase().includes(b.label.toLowerCase()) || b.label.toLowerCase().includes(semStr.toLowerCase())) {
        return b.id;
      }
    }
  }

  if (dateStr) {
    const parsed = parseExcelDate(dateStr);
    if (parsed.date) {
      for (const b of buckets) {
        if (parsed.date >= b.startDate && parsed.date <= new Date(b.endDate.getTime() + 86400000)) {
          return b.id;
        }
      }
    }
  }

  return currentBucket.id;
}

/**
 * Generates month catalog for 10 years (2026 to 2036) for UI dropdowns and filters
 */
export function get10YearMonthsCatalog(startYear = 2026, totalYears = 10): { value: string; label: string; year: number; month: number }[] {
  const catalog: { value: string; label: string; year: number; month: number }[] = [];
  for (let y = startYear; y < startYear + totalYears; y++) {
    for (let m = 0; m < 12; m++) {
      const monthName = MONTH_NAMES_FULL[m];
      catalog.push({
        value: `${monthName} ${y}`,
        label: `${monthName} ${y}`,
        year: y,
        month: m
      });
    }
  }
  return catalog;
}

/**
 * Returns formatted date string in Portuguese, e.g. "Segunda-feira, 11 de Agosto de 2026"
 */
export function getCurrentDateFormatted(d: Date = new Date()): string {
  const day = WEEKDAY_NAMES_PT[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_FULL[d.getMonth()];
  const year = d.getFullYear();
  return `${day}, ${dayNum} de ${month} de ${year}`;
}
