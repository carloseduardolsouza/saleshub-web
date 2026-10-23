import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import './CustomInput.css';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className={`form-group ${error ? 'form-group--error' : ''}`}>
        {label && <label className="form-label" htmlFor={inputId}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input--error' : ''} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <span id={`${inputId}-error`} className="form-error" role="alert">{error}</span>}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
