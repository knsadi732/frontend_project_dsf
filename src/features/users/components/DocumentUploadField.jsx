import { Check, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';

export function DocumentUploadField({ label, fileName, onChange }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm hover:border-primary',
        fileName && 'border-solid border-success/50 bg-success/5',
      )}
    >
      <span className="flex items-center gap-2 text-text">
        {fileName ? <Check className="size-4 text-success" /> : <Upload className="size-4 text-text-muted" />}
        {label}
      </span>
      <span className="truncate text-xs text-text-muted">{fileName ?? 'Upload'}</span>
      <input
        type="file"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}
