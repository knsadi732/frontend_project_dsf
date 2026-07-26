import { BaseBadge } from '@/components/ui/BaseBadge';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

/**
 * Single reusable status pill for every table/detail view in the app —
 * stop redeclaring a local STATUS_VARIANT map + <BaseBadge> pair per
 * feature. Looks the status up in the shared STATUS_BADGE_VARIANT map
 * (constants/statusEnums.js); pass `variantMap` only for a status set that
 * doesn't belong in that shared map.
 */
export function StatusBadge({ status, variantMap, className }) {
  const variant = (variantMap ?? STATUS_BADGE_VARIANT)[status] ?? 'default';
  const label = status ? String(status).replace(/_/g, ' ') : '—';
  return (
    <BaseBadge variant={variant} className={className}>
      {label}
    </BaseBadge>
  );
}
