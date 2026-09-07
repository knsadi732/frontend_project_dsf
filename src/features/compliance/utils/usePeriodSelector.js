import { useMemo, useState } from 'react';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import {
  currentFyQuarter,
  currentFyStartYear,
  currentMonthValue,
  fyMonthOptions,
  fyRange,
  monthRange,
  quarterRange,
} from '@/features/compliance/utils/reportPeriod';

/**
 * Shared state machine behind the app's period-type filter (YTD / Quarterly /
 * Monthly / Custom) — used by both Compliance → Reports and the Dashboard
 * Overview so both pick periods the same way. `monthMode: 'fy-anchored'`
 * restricts Monthly to the selected FY's 12 months (a dropdown, not a free
 * month picker) — pass 'native' to keep the original free `<input type="month">`.
 */
export function usePeriodSelector({ defaultType = 'monthly', monthMode = 'native' } = {}) {
  const [periodType, setPeriodType] = useState(defaultType);
  const [monthValue, setMonthValue] = useState(() => currentMonthValue());
  const [fyStartYear, setFyStartYear] = useState(() => String(currentFyStartYear()));
  const [quarter, setQuarter] = useState(() => String(currentFyQuarter()));
  // Custom mode reuses the debounced two-date-field behaviour (only fires once both are set).
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();

  // fy-anchored month mode: changing FY while Monthly is selected can leave
  // monthValue outside the new FY's 12 months (e.g. FY 26-27 -> 25-26 while
  // "Sep 2026" was picked) — snap to that FY's current month if it's the
  // current FY, else its April. Driven from the same event that changes the
  // FY (not a reactive effect), so it's one state update, not a cascade.
  const setFyStartYearForMonthly = (nextFyStartYear) => {
    setFyStartYear(nextFyStartYear);
    if (monthMode !== 'fy-anchored') return;
    const validValues = fyMonthOptions(Number(nextFyStartYear)).map((o) => o.value);
    if (validValues.includes(monthValue)) return;
    setMonthValue(Number(nextFyStartYear) === currentFyStartYear() ? currentMonthValue() : validValues[0]);
  };

  const range = useMemo(() => {
    if (periodType === 'monthly') return monthRange(monthValue);
    if (periodType === 'quarterly') return quarterRange(Number(fyStartYear), Number(quarter));
    if (periodType === 'ytd') return fyRange(Number(fyStartYear));
    return { from: appliedDateFrom || undefined, to: appliedDateTo || undefined };
  }, [periodType, monthValue, fyStartYear, quarter, appliedDateFrom, appliedDateTo]);

  return {
    range,
    monthMode,
    periodType,
    setPeriodType,
    monthValue,
    setMonthValue,
    fyStartYear,
    setFyStartYear,
    setFyStartYearForMonthly,
    quarter,
    setQuarter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
}
