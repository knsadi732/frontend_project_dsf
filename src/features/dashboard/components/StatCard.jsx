import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

// Soft tinted card + an icon-badge accent (the reference structure), but
// every tone stays a shade of the logo's own blue/grey — no rainbow of
// competing hues (that read as visually noisy/eye-straining at a glance
// across 9 tiles). Light mode gets an airy tint, dark mode its muted-dark
// equivalent, so it never reads as a bright patch inside a dark UI.
const TONES = {
  navy: { light: '#E7EFFC', dark: '#182848', icon: '#1c4c8f' },
  blue: { light: '#E9F1FC', dark: '#1E3A5F', icon: '#2a78d6' },
  sky: { light: '#EDF4FC', dark: '#24425F', icon: '#3d8ce8' },
  charcoal: { light: '#EEF0F3', dark: '#2A3240', icon: '#3f4b5c' },
  steel: { light: '#F1F2F4', dark: '#333B47', icon: '#6b7280' },
  silver: { light: '#F4F5F6', dark: '#3A4048', icon: '#9ca3af' },
};

export function StatCard({ label, value, delta, icon: Icon, tone = 'blue', subtitle, onClick, compact = false }) {
  const theme = useThemeStore((s) => s.theme);
  const isPositive = delta?.startsWith('+');
  const palette = TONES[tone] ?? TONES.blue;
  const cardBg = theme === 'dark' ? palette.dark : palette.light;
  const Wrapper = onClick ? 'button' : 'div';

  if (compact) {
    return (
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={onClick ? 'block w-full text-left transition-transform duration-150 hover:-translate-y-0.5' : 'block w-full'}
      >
        <div className="flex min-h-[48px] flex-row items-center gap-2 rounded-xl px-2.5 py-1.5" style={{ background: cardBg }}>
          {Icon && (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: palette.icon }}>
              <Icon className="size-3.5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-text-muted">{label}</p>
            <p className="truncate text-base font-semibold tracking-tight text-text">{value}</p>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={onClick ? 'block w-full text-left transition-transform duration-150 hover:-translate-y-0.5' : 'block w-full'}
    >
      <div className="flex min-h-[112px] flex-col justify-between rounded-2xl p-4" style={{ background: cardBg }}>
        <div className="flex items-start justify-between gap-2">
          {Icon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: palette.icon }}>
              <Icon className="size-4" />
            </div>
          )}
          {delta && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              style={{ color: palette.icon, background: `${palette.icon}22` }}
            >
              {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {delta}
            </span>
          )}
        </div>
        {/* Sizes bumped off the old 10.5/11px: sub-11px labels are what make
            a tile wall tiring to scan — you squint instead of reading. */}
        <div className="mt-2.5">
          <p className="truncate text-xs font-medium text-text-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-text">{value}</p>
          {subtitle && <p className="mt-1 truncate text-xs leading-relaxed text-text-muted">{subtitle}</p>}
        </div>
      </div>
    </Wrapper>
  );
}
