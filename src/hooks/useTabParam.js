import { useSearchParams } from 'react-router-dom';

/**
 * Same shape as `useState` for a page's active tab, except the choice lives
 * in the URL (`?tab=...`) instead of component state — so the sidebar's
 * sub-item links and dashboard deep-links can select a tab just by
 * navigating, and the current tab survives a refresh/share/back-button.
 */
export function useTabParam(defaultTab) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || defaultTab;

  const setActiveTab = (tab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      },
      { replace: true },
    );
  };

  return [activeTab, setActiveTab];
}
