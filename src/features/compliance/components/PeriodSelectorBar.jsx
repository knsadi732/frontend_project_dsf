import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { FilterBar } from '@/components/ui/FilterBar';
import { fyMonthOptions, fyOptions, QUARTER_OPTIONS, formatDisplayDate } from '@/features/compliance/utils/reportPeriod';

// Order matches the dropdown order requested (YTD, Quarterly, Monthly, Custom) —
// default selection (passed via usePeriodSelector's defaultType) is 'monthly'.
const PERIOD_TYPE_OPTIONS = [
  { value: 'ytd', label: 'YTD (Financial Year)' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

/** Renders the controls for a `usePeriodSelector()` state object — pass it straight through as `state`. */
export function PeriodSelectorBar({ state, showRangeLabel = true }) {
  const {
    range, monthMode, periodType, setPeriodType, monthValue, setMonthValue,
    fyStartYear, setFyStartYear, setFyStartYearForMonthly, quarter, setQuarter,
    dateFrom, setDateFrom, dateTo, setDateTo,
  } = state;

  return (
    <div className="flex flex-col gap-1">
      <FilterBar>
        <AppSelect
          value={periodType}
          onChange={(event) => setPeriodType(event.target.value)}
          options={PERIOD_TYPE_OPTIONS}
          className="w-40"
          aria-label="Period type"
        />

        {periodType === 'monthly' && monthMode === 'native' && (
          <AppInput
            type="month"
            value={monthValue}
            onChange={(event) => setMonthValue(event.target.value)}
            className="w-40"
            aria-label="Month"
          />
        )}

        {periodType === 'monthly' && monthMode === 'fy-anchored' && (
          <>
            <AppSelect
              value={fyStartYear}
              onChange={(event) => setFyStartYearForMonthly(event.target.value)}
              options={fyOptions()}
              className="w-32"
              aria-label="Financial year"
            />
            <AppSelect
              value={monthValue}
              onChange={(event) => setMonthValue(event.target.value)}
              options={fyMonthOptions(Number(fyStartYear))}
              className="w-32"
              aria-label="Month"
            />
          </>
        )}

        {periodType === 'quarterly' && (
          <>
            <AppSelect
              value={fyStartYear}
              onChange={(event) => setFyStartYear(event.target.value)}
              options={fyOptions()}
              className="w-32"
              aria-label="Financial year"
            />
            <AppSelect
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
              options={QUARTER_OPTIONS}
              className="w-44"
              aria-label="Quarter"
            />
          </>
        )}

        {periodType === 'ytd' && (
          <AppSelect
            value={fyStartYear}
            onChange={(event) => setFyStartYear(event.target.value)}
            options={fyOptions()}
            className="w-32"
            aria-label="Financial year"
          />
        )}

        {periodType === 'custom' && (
          <>
            <AppInput
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-36"
              aria-label="Period from"
            />
            <AppInput
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-36"
              aria-label="Period to"
            />
          </>
        )}
      </FilterBar>

      {showRangeLabel && range.from && range.to && (
        <p className="text-xs text-text-muted">
          Showing: {formatDisplayDate(range.from)} – {formatDisplayDate(range.to)}
        </p>
      )}
    </div>
  );
}
