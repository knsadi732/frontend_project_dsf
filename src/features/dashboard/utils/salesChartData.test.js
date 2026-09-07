import { describe, expect, it } from 'vitest';
import { salesTotalsInRange, salesUnitsInRange, salesTargetProgress } from './salesChartData';

const orders = [
  { orderDate: '2026-09-01', total: '8505.00', items: [{ quantity: '18.00' }] },
  { orderDate: '2026-09-05', total: '9450.00', items: [{ quantity: '20.00' }] },
  { orderDate: '2026-08-31', total: '5000.00', items: [{ quantity: '10.00' }] }, // outside range
];

describe('salesTotalsInRange', () => {
  it('sums only orders whose date falls inside [from, to]', () => {
    const result = salesTotalsInRange(orders, '2026-09-01', '2026-09-30');
    expect(result).toEqual({ total: 8505 + 9450, count: 2 });
  });

  it('returns zero for an empty range', () => {
    expect(salesTotalsInRange(orders, null, null)).toEqual({ total: 0, count: 0 });
  });
});

describe('salesUnitsInRange', () => {
  it('sums item quantities across in-range orders', () => {
    expect(salesUnitsInRange(orders, '2026-09-01', '2026-09-30')).toBe(38);
  });
});

describe('salesTargetProgress', () => {
  it('builds one cumulative row per day of the month, from-month prefix included', () => {
    const rows = salesTargetProgress(orders, '2026-09-01', '2026-09-30', null, null);
    expect(rows[0]).toMatchObject({ day: 1, date: '2026-09-01', actualRevenue: 8505 });
    // day 5 = 2026-09-05, cumulative revenue includes both in-range orders by then.
    expect(rows[4]).toMatchObject({ day: 5, date: '2026-09-05', actualRevenue: 8505 + 9450 });
  });

  it('returns an empty array when the range is unbounded', () => {
    expect(salesTargetProgress(orders, null, null, null, null)).toEqual([]);
  });
});
