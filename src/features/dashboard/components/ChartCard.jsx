import { BaseCard } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

// Dot accents stay within the logo's blue/grey family too.
const DOTS = {
  navy: '#1c4c8f',
  blue: '#2a78d6',
  sky: '#4f97e8',
  charcoal: '#3f4b5c',
  steel: '#6b7280',
  silver: '#9ca3af',
};

export function ChartCard({ title, subtitle, tone = 'blue', className, children }) {
  const dotColor = DOTS[tone] ?? DOTS.blue;

  return (
    <div className="p-1" style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))' }}>
      <BaseCard
        className={cn('relative overflow-hidden p-3.5', className)}
        style={{
          clipPath: 'polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px)',
          borderTop: `3px solid ${dotColor}55`,
          borderLeft: `3px solid ${dotColor}55`,
          borderRight: '3px solid rgba(0,0,0,0.28)',
          borderBottom: '3px solid rgba(0,0,0,0.28)',
          boxSizing: 'border-box',
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: dotColor, boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          />
          <h2 className="text-sm font-medium text-text">{title}</h2>
        </div>
        {subtitle && <p className="-mt-1 mb-2 text-xs text-text-muted">{subtitle}</p>}
        {children}
      </BaseCard>
    </div>
  );
}
