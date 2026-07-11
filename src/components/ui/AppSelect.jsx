import { forwardRef, useId } from 'react';
import { BaseSelect } from '@/components/ui/BaseSelect';
import { cn } from '@/utils/cn';

export const AppSelect = forwardRef(function AppSelect(
  { label, error, helperText, id, options = [], placeholder, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <BaseSelect
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'h-8 border-border bg-gradient-to-b from-surface to-primary/10 text-text focus-visible:border-primary',
          error && 'border-danger focus-visible:border-danger',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </BaseSelect>
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
