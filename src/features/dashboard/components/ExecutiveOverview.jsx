import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Factory, TrendingUp, Landmark, PackageCheck, ScrollText } from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { PeriodSelectorBar } from '@/features/compliance/components/PeriodSelectorBar';
import { formatDisplayDate } from '@/features/compliance/utils/reportPeriod';

function fmtCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * CEO/Owner-level "at a glance" tiles — the NetSuite-style Home tiles pattern
 * requested: 6 headline numbers plus the secondary ops stats, all in one flex
 * row so it reads as a single line on a normal laptop width (they wrap only
 * if the viewport is too narrow to fit them). Each headline tile is a
 * click-through into the existing dedicated page for the full detail (no
 * separate detail views are built — Sales/Production/Finance/Inventory
 * already are the "detail pages").
 *
 * Sales/Production/Revenue are period-flow numbers, scoped by `periodSelector`
 * (same YTD/Quarterly/Monthly/Custom picker as Compliance → Reports — see
 * usePeriodSelector). Company Fund/Inventory/Payable are point-in-time
 * balances (like a Balance Sheet, not a P&L) — a "period" doesn't apply to
 * them, so they always show the current live figure regardless of the picker.
 * `opsStats` (compact, secondary) sit in the same row too — headcount/floor
 * status, not sales/production/finance flow, so deliberately smaller.
 */
export function ExecutiveOverview({
  periodSelector,
  canViewSales,
  canViewInventory,
  canViewFinance,
  salesInPeriod,
  ordersInPeriod,
  productionInPeriod,
  revenueInPeriod,
  cashBalance,
  inventoryOnHand,
  payableTotal,
  opsStats = [],
  hideHeader = false,
}) {
  const navigate = useNavigate();

  if (!canViewSales && !canViewInventory && !canViewFinance) return null;

  return (
    <div className="flex flex-col gap-2">
      {!hideHeader && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-sm font-semibold text-text">Overview</h2>
            {periodSelector.range.from && periodSelector.range.to && (
              <span className="text-xs text-text-muted">
                Sales / Production / Revenue for {formatDisplayDate(periodSelector.range.from)} – {formatDisplayDate(periodSelector.range.to)}
              </span>
            )}
          </div>
          <PeriodSelectorBar state={periodSelector} showRangeLabel={false} />
        </div>
      )}

      {/* Even grid, not fixed-width flex-wrap: fixed widths left a ragged
          last row (one full-size tile stranded next to the compact ones).
          Tiles now share the column width evenly at every breakpoint. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {canViewSales && (
          <div>
            <StatCard
              label="Sales"
              value={fmtCurrency(salesInPeriod)}
              subtitle={`${ordersInPeriod ?? 0} orders in period`}
              icon={ShoppingCart}
              tone="navy"
              onClick={() => navigate('/sales')}
            />
          </div>
        )}
        <div>
          <StatCard
            label="Production"
            value={(productionInPeriod ?? 0).toLocaleString('en-IN')}
            subtitle="units produced in period"
            icon={Factory}
            tone="steel"
            onClick={() => navigate('/production')}
          />
        </div>
        {canViewFinance && (
          <div>
            <StatCard
              label="Revenue"
              value={fmtCurrency(revenueInPeriod)}
              subtitle="in period, from books"
              icon={TrendingUp}
              tone="blue"
              onClick={() => navigate('/finance?tab=complianceReports')}
            />
          </div>
        )}
        {canViewFinance && (
          <div>
            <StatCard
              label="Fund Available"
              value={cashBalance != null ? fmtCurrency(cashBalance) : '—'}
              subtitle="DSF bank/cash — current"
              icon={Landmark}
              tone={cashBalance == null || cashBalance >= 0 ? 'sky' : 'charcoal'}
              onClick={() => navigate('/finance?tab=ledger')}
            />
          </div>
        )}
        {canViewInventory && (
          <div>
            <StatCard
              label="Inventory"
              value={String(inventoryOnHand ?? 0)}
              subtitle="units on hand — current"
              icon={PackageCheck}
              tone="silver"
              onClick={() => navigate('/inventory')}
            />
          </div>
        )}
        {canViewFinance && (
          <div>
            <StatCard
              label="Payable"
              value={fmtCurrency(payableTotal)}
              subtitle="loans + dues — current"
              icon={ScrollText}
              tone="charcoal"
              onClick={() => navigate('/finance?tab=payables')}
            />
          </div>
        )}

      </div>

      {/* Secondary ops stats get their own row — smaller tiles, so mixing
          them into the headline grid above left uneven row heights. */}
      {opsStats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {opsStats.map((stat) => (
            <StatCard key={stat.label} compact label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
          ))}
        </div>
      )}
    </div>
  );
}
