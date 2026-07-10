import { useEffect, useState } from 'react';
import { DEBOUNCE_MS } from '@/config/constants';

export function useDebounce(value, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
