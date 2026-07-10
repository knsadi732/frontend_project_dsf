import { useEffect } from 'react';

export function useKeyPress(targetKey, handler, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(event) {
      if (event.key === targetKey) handler(event);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [targetKey, handler, enabled]);
}
