import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

// Every tone is a shade of the logo's own blue/grey — no other hues, per
// brand direction. Light-to-dark diagonal direction matches the logo's
// own bevel (lit top-left, shadowed bottom-right).
const TONES = {
  navy: ['#3d8ce8', '#1c4c8f'],
  blue: ['#6fb0f5', '#2a78d6'],
  sky: ['#9cc8f5', '#3d8ce8'],
  charcoal: ['#8a94a3', '#3f4b5c'],
  steel: ['#c3c9d1', '#6b7280'],
  silver: ['#e4e7eb', '#9ca3af'],
};

export function StatCard({ label, value, delta, icon: Icon, tone = 'blue' }) {
  const isPositive = delta?.startsWith('+');
  const [light, dark] = TONES[tone] ?? TONES.blue;

  return (
    <div className="p-1" style={{ filter: `drop-shadow(0 10px 16px ${dark}80)` }}>
      <div
        className="relative flex min-h-[104px] flex-col justify-between overflow-hidden p-3.5 text-white"
        style={{
          background: `linear-gradient(160deg, ${light} 0%, ${dark} 100%)`,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          // a real, visibly-thick bevel like the logo's extruded letters:
          // a bright ridge where the light hits (top/left), a dark ridge
          // in shadow (bottom/right) — not a 1px hint, a plaque edge.
          borderTop: '3px solid rgba(255,255,255,0.75)',
          borderLeft: '3px solid rgba(255,255,255,0.75)',
          borderRight: '3px solid rgba(0,0,0,0.45)',
          borderBottom: '3px solid rgba(0,0,0,0.45)',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.4) 0%, transparent 38%)' }}
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between gap-2">
          {Icon && (
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/25"
              style={{
                borderTop: '2px solid rgba(255,255,255,0.7)',
                borderLeft: '2px solid rgba(255,255,255,0.7)',
                borderRight: '2px solid rgba(0,0,0,0.35)',
                borderBottom: '2px solid rgba(0,0,0,0.35)',
              }}
            >
              <Icon className="size-4" />
            </div>
          )}
          {delta && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-black/25 px-1.5 py-0.5 text-[11px] font-semibold">
              {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {delta}
            </span>
          )}
        </div>
        <div className="relative">
          <p className="truncate text-[10.5px] font-medium uppercase tracking-wide text-white/85">{label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight" style={{ textShadow: '0 1px 0 rgba(0,0,0,0.35)' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
