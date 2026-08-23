import { useState } from 'react';

const PREFIX = 'tab:';

/**
 * Same shape as `useState` for a page's active tab, except the choice
 * survives a page refresh — stored in localStorage under `tab:<storageKey>`.
 * Falls back to `defaultTab` when nothing's stored yet, or when storage is
 * unavailable (private browsing, disabled storage) — a broken read/write
 * there should never crash the page, just fall back silently.
 */
export function usePersistedTab(storageKey, defaultTab) {
  const key = `${PREFIX}${storageKey}`;

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem(key) || defaultTab;
    } catch {
      return defaultTab;
    }
  });

  const setPersistedTab = (tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem(key, tab);
    } catch {
      // ignore — the tab still switches for this session, just won't persist
    }
  };

  return [activeTab, setPersistedTab];
}
