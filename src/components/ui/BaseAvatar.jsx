import { cn } from '@/utils/cn';

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function BaseAvatar({ name, src, size = 'md', className }) {
  const sizeClass = size === 'sm' ? 'size-7 text-xs' : size === 'lg' ? 'size-12 text-base' : 'size-9 text-sm';

  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name} avatar` : 'avatar'}
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/15 font-medium text-primary',
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name) || '?'}
    </span>
  );
}
