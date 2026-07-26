import { useId } from 'react';
import { Ban, Check, Download, ExternalLink, Pencil, Trash2, Upload, X } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';

/**
 * One reusable icon-button per common row action (edit/delete/download/
 * upload/approve/reject/cancel) so tables stop hand-rolling the same
 * <AppButton variant=... size="sm" title=... aria-label=...><Icon /></AppButton>
 * every time. Each preset fixes the icon + a sensible default variant/label;
 * pass `label` to override the tooltip/aria-label text for context (e.g.
 * "Approve PR" vs "Approve PO"), and any other AppButton prop (onClick,
 * disabled, className) passes straight through.
 */
function IconActionButton({ icon: Icon, label, variant, onClick, ...props }) {
  return (
    <AppButton variant={variant} size="sm" title={label} aria-label={label} onClick={onClick} {...props}>
      <Icon className="size-4" />
    </AppButton>
  );
}

export function EditButton({ label = 'Edit', variant = 'ghost', ...props }) {
  return <IconActionButton icon={Pencil} label={label} variant={variant} {...props} />;
}

export function DeleteButton({ label = 'Delete', variant = 'ghost', className = 'text-danger hover:bg-danger/10', ...props }) {
  return <IconActionButton icon={Trash2} label={label} variant={variant} className={className} {...props} />;
}

export function DownloadButton({ label = 'Download', variant = 'download', ...props }) {
  return <IconActionButton icon={Download} label={label} variant={variant} {...props} />;
}

export function ApproveButton({ label = 'Approve', variant = 'success', ...props }) {
  return <IconActionButton icon={Check} label={label} variant={variant} {...props} />;
}

export function RejectButton({ label = 'Reject', variant = 'danger', ...props }) {
  return <IconActionButton icon={X} label={label} variant={variant} {...props} />;
}

export function CancelButton({ label = 'Cancel', variant = 'danger', ...props }) {
  return <IconActionButton icon={Ban} label={label} variant={variant} {...props} />;
}

/**
 * Opens a link (e.g. a previously uploaded file) in a new tab — same
 * h-8/px-3.5/hover-background box as every AppButton-based preset above,
 * so a "view" action never looks like a bare, unstyled <a> next to real
 * buttons in the same row.
 */
export function ViewButton({ label = 'View', href, className }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      aria-label={label}
      className={`inline-flex h-8 items-center justify-center rounded-md bg-transparent px-3.5 font-medium text-text transition-all hover:bg-gradient-to-b hover:from-surface hover:to-surface-hover hover:shadow-sm ${className ?? ''}`}
    >
      <ExternalLink className="size-4" />
    </a>
  );
}

/**
 * File-picker button — no native onClick (browsers require a real
 * <input type="file"> in the DOM), so this renders a hidden input plus a
 * button-styled <label htmlFor>. `onFileSelected(file)` fires once per pick
 * and the input is cleared immediately after, so re-selecting the same
 * file still fires a change event next time.
 */
export function UploadButton({ label = 'Upload', variant = 'ghost', accept, disabled, onFileSelected, className }) {
  const inputId = useId();

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelected(file);
  };

  return (
    <>
      <label
        htmlFor={inputId}
        title={label}
        aria-label={label}
        className={`inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-3.5 font-medium transition-all ${
          disabled ? 'pointer-events-none opacity-50' : ''
        } ${
          variant === 'ghost'
            ? 'bg-transparent text-text hover:bg-gradient-to-b hover:from-surface hover:to-surface-hover hover:shadow-sm'
            : 'bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-md shadow-primary/20 hover:brightness-110'
        } ${className ?? ''}`}
      >
        <Upload className="size-4" />
      </label>
      <input id={inputId} type="file" accept={accept} className="hidden" onChange={handleChange} disabled={disabled} />
    </>
  );
}
