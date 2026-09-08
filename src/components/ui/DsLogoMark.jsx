import logo from '@/assets/logo.png';
import { cn } from '@/utils/cn';

// The real DS Footwear brand mark (raster PNG) — height set by `size`,
// width follows automatically so the logo never distorts.
export function DsLogoMark({ size = 32, className }) {
  return <img src={logo} alt="DS Footwear" className={cn('inline-block w-auto object-contain', className)} style={{ height: size }} />;
}
