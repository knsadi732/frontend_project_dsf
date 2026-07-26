import { useId } from 'react';
import { Ban, Check, Download, ExternalLink, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { Tooltip } from '@/components/ui/Tooltip';

// AppButton renders its own styled tooltip whenever a `title` prop is
// passed — ViewButton/UploadButton below wrap a plain <a>/<label> instead
// of AppButton, so they still wrap themselves in <Tooltip> explicitly.

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
 * The page-header "New X" primary action — every list page hand-rolled
 * `<AppButton><Plus />New X</AppButton>` identically; this fixes the icon
 * + spacing so pages only need to pass the label and onClick.
 */
export function CreateButton({ children, ...props }) {
  return (
    <AppButton {...props}>
      <Plus className="size-4" />
      {children}
    </AppButton>
  );
}

/**
 * Opens a link (e.g. a previously uploaded file) in a new tab. Uses the
 * same violet/purple gradient as AppButton's `view` variant — deliberately
 * distinct from Download's emerald/teal so the two are never confused —
 * always visible (not hover-reveal like ghost) since View is a real
 * standalone action, not incidental chrome.
 */
export function ViewButton({ label = 'View', href, className }) {
  return (
    <Tooltip label={label}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className={`inline-flex h-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 px-3.5 font-medium text-white shadow-md shadow-violet-500/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/25 ${className ?? ''}`}
      >
        <ExternalLink className="size-4" />
      </a>
    </Tooltip>
  );
}

/**
 * File-picker button — no native onClick (browsers require a real
 * <input type="file"> in the DOM), so this renders a hidden input plus a
 * button-styled <label htmlFor>. `onFileSelected(file)` fires once per pick
 * and the input is cleared immediately after, so re-selecting the same
 * file still fires a change event next time. Blue/cyan gradient (trust +
 * freshness), always visible — kept distinct from Download (emerald/teal)
 * and View (violet/purple).
 */
export function UploadButton({ label = 'Upload', accept, disabled, onFileSelected, className }) {
  const inputId = useId();

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelected(file);
  };

  return (
    <>
      <Tooltip label={label}>
        <label
          htmlFor={inputId}
          aria-label={label}
          className={`inline-flex h-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 px-3.5 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-blue-500/25 ${
            disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          } ${className ?? ''}`}
        >
          <Upload className="size-4" />
        </label>
      </Tooltip>
      <input id={inputId} type="file" accept={accept} className="hidden" onChange={handleChange} disabled={disabled} />
    </>
  );
}
