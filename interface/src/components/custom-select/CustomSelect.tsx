import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import './CustomSelect.css';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
      <div className={`form-group ${error ? 'form-group--error' : ''}`}>
        {label && <label className="form-label" htmlFor={selectId}>{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={`select ${error ? 'select--error' : ''} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span id={`${selectId}-error`} className="form-error" role="alert">{error}</span>}
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';
