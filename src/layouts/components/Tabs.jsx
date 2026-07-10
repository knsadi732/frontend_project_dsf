import { cn } from '@/utils/cn';

export function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
