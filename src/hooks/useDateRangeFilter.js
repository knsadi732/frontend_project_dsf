import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Local dateFrom/dateTo state for filter UIs where a fetch only makes sense
 * once both ends of the range are chosen. `appliedDateFrom`/`appliedDateTo`
 * stay empty (no query change, no request) until both fields have a value;
 * once they do, changes are debounced as one unit so adjusting either field
 * again shortly after doesn't fire a request per keystroke.
 */
export function useDateRangeFilter(delay = 500) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const isComplete = Boolean(dateFrom) && Boolean(dateTo);
  const debouncedKey = useDebounce(isComplete ? `${dateFrom}__${dateTo}` : '', delay);
  const [appliedDateFrom, appliedDateTo] = debouncedKey ? debouncedKey.split('__') : ['', ''];

  return { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo };
}
