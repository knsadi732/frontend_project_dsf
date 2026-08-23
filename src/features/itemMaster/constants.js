// Chapter 8.4/8.7 stock outcome kinds — every Item Category routes to
// exactly one of these once purchased (item.repository.js CHECK constraint).
export const STOCK_KIND_OPTIONS = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'packaging_material', label: 'Packaging Material' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'spare_part', label: 'Spare Part' },
  { value: 'fixed_asset', label: 'Fixed Asset' },
  { value: 'tool', label: 'Tool' },
  { value: 'service', label: 'Service' },
];

export const STOCK_KIND_LABEL = Object.fromEntries(STOCK_KIND_OPTIONS.map((o) => [o.value, o.label]));
