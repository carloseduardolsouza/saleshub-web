import { type SelectHTMLAttributes, forwardRef } from 'react';
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
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${error ? 'form-group--error' : ''}`}>
        {label && <label className="form-label">{label}</label>}
        <select
          ref={ref}
          className={`select ${error ? 'select--error' : ''} ${className}`}
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
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';
