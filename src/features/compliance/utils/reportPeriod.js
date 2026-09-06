// Indian financial year: 1 April – 31 March. A financial year is identified
// by its start calendar year (e.g. 2026 for "FY 26-27") throughout this file.
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const QUARTER_MONTHS = {
  1: { startMonth: 4, endMonth: 6, yearOffsetStart: 0, yearOffsetEnd: 0 }, // Apr-Jun
  2: { startMonth: 7, endMonth: 9, yearOffsetStart: 0, yearOffsetEnd: 0 }, // Jul-Sep
  3: { startMonth: 10, endMonth: 12, yearOffsetStart: 0, yearOffsetEnd: 0 }, // Oct-Dec
  4: { startMonth: 1, endMonth: 3, yearOffsetStart: 1, yearOffsetEnd: 1 }, // Jan-Mar (next calendar year)
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function lastDayOfMonth(year, month /* 1-12 */) {
  return new Date(year, month, 0).getDate();
}

function isoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** FY start year containing `date` — e.g. any date in Apr 2026–Mar 2027 returns 2026. */
export function currentFyStartYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  return month >= 4 ? year : year - 1;
}

/** "26-27" label for the FY starting in `startYear`. */
export function fyLabel(startYear) {
  return `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
}

/** Quarter (1-4) containing `date`, within its own FY. */
export function currentFyQuarter(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 4 && month <= 6) return 1;
  if (month >= 7 && month <= 9) return 2;
  if (month >= 10 && month <= 12) return 3;
  return 4;
}

/** Last N financial years (most recent first) as { value, label } options, value = start year as string. */
export function fyOptions(count = 6, date = new Date()) {
  const current = currentFyStartYear(date);
  return Array.from({ length: count }, (_, i) => current - i).map((startYear) => ({
    value: String(startYear),
    label: `FY ${fyLabel(startYear)}`,
  }));
}

export const QUARTER_OPTIONS = [
  { value: '1', label: 'Q1 (Apr - Jun)' },
  { value: '2', label: 'Q2 (Jul - Sep)' },
  { value: '3', label: 'Q3 (Oct - Dec)' },
  { value: '4', label: 'Q4 (Jan - Mar)' },
];

/** {from, to} covering the whole financial year starting in `startYear`. */
export function fyRange(startYear) {
  return { from: isoDate(startYear, 4, 1), to: isoDate(startYear + 1, 3, 31) };
}

/** {from, to} covering one quarter (1-4) of the FY starting in `startYear`. */
export function quarterRange(startYear, quarter) {
  const { startMonth, endMonth, yearOffsetStart, yearOffsetEnd } = QUARTER_MONTHS[quarter];
  const startYearActual = startYear + yearOffsetStart;
  const endYearActual = startYear + yearOffsetEnd;
  return {
    from: isoDate(startYearActual, startMonth, 1),
    to: isoDate(endYearActual, endMonth, lastDayOfMonth(endYearActual, endMonth)),
  };
}

/** {from, to} covering one calendar month. `monthValue` is "YYYY-MM" (native <input type="month"> format). */
export function monthRange(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  return { from: isoDate(year, month, 1), to: isoDate(year, month, lastDayOfMonth(year, month)) };
}

/** Current month as "YYYY-MM", for defaulting the month picker. */
export function currentMonthValue(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function monthLabel(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** "YYYY-MM-DD" -> "DD Mon YYYY", parsed as plain date parts so it never shifts a
 * day off from timezone conversion the way `new Date(isoString)` can. */
export function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day} ${MONTH_NAMES[Number(month) - 1].slice(0, 3)} ${year}`;
}
