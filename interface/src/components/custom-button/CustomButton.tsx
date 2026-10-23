import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './CustomButton.css';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export function CustomButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
