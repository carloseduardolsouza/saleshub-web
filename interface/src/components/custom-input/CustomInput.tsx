import { type InputHTMLAttributes, forwardRef } from 'react';
import './CustomInput.css';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${error ? 'form-group--error' : ''}`}>
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          className={`input ${error ? 'input--error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
