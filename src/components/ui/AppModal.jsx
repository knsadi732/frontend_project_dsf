import { useId } from 'react';
import { X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { AppButton } from '@/components/ui/AppButton';

export function AppModal({ open, onClose, title, footer, children, className }) {
  const titleId = useId();

  return (
    <BaseModal open={open} onClose={onClose} labelledBy={titleId} className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 id={titleId} className="text-lg font-semibold text-text">
          {title}
        </h2>
        <AppButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close dialog"
          className="px-2"
        >
          <X className="size-4" />
        </AppButton>
      </div>
      <div>{children}</div>
      {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
    </BaseModal>
  );
}
