import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './CustomButton.css';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

export function CustomButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
