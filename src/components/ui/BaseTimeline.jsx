import { cn } from '@/utils/cn';

export function BaseTimeline({ items = [], className }) {
  return (
    <ol className={cn('flex flex-col gap-4', className)}>
      {items.map((item, index) => (
        <li key={item.id ?? index} className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {index < items.length - 1 && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-text">{item.title}</p>
            {item.description && <p className="text-sm text-text-muted">{item.description}</p>}
            {item.timestamp && <p className="mt-0.5 text-xs text-text-muted">{item.timestamp}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
