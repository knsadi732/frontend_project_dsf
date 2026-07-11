import { forwardRef, useId } from 'react';
import { BaseInput } from '@/components/ui/BaseInput';
import { cn } from '@/utils/cn';

export const AppInput = forwardRef(function AppInput(
  { label, error, helperText, id, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <BaseInput
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'h-8 border-border bg-gradient-to-b from-surface to-primary/10 text-text placeholder:text-text-muted focus-visible:border-primary',
          error && 'border-danger focus-visible:border-danger',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        helperText && <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
});
