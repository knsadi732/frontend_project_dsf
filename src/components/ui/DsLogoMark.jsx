import { cn } from '@/utils/cn';

// The DS Footwear mark rebuilt with real CSS (gradient-filled text + a
// stacked drop-shadow extrusion faking the logo's raised/beveled metal
// look), not the raster PNG — crisp at any size, no image request.
export function DsLogoMark({ size = 32, className }) {
  const fontSize = size;
  return (
    <span
      className={cn('relative inline-flex items-center leading-none', className)}
      style={{ fontFamily: "'Archivo Black', 'Segoe UI', system-ui, sans-serif", fontWeight: 900, fontSize }}
      aria-hidden="true"
    >
      <span
        style={{
          background: 'linear-gradient(160deg, #6fb0f5 0%, #2a78d6 55%, #1c4c8f 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter:
            'drop-shadow(1px 1.5px 0 #1c4c8f) drop-shadow(2px 3px 0 #14375f) drop-shadow(0 5px 7px rgba(0,0,0,0.4))',
        }}
      >
        D
      </span>
      <span
        style={{
          marginLeft: '-0.06em',
          background: 'linear-gradient(160deg, #eef0f3 0%, #9ca3af 55%, #6b7280 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter:
            'drop-shadow(1px 1.5px 0 #6b7280) drop-shadow(2px 3px 0 #4b5563) drop-shadow(0 5px 7px rgba(0,0,0,0.35))',
        }}
      >
        S
      </span>
      <span
        className="absolute rounded-full opacity-90"
        style={{
          left: '6%',
          right: '4%',
          top: '46%',
          height: Math.max(1.5, size * 0.02),
          transform: 'rotate(-9deg)',
          background:
            'repeating-linear-gradient(90deg, #ffffff 0, #ffffff 30%, transparent 30%, transparent 55%)',
          backgroundSize: `${size * 0.16}px 100%`,
        }}
      />
    </span>
  );
}
