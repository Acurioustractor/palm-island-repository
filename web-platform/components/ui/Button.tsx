'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'cta' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-picc-red hover:bg-picc-red text-white shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
  cta: 'bg-gradient-to-r from-picc-red to-picc-red hover:from-picc-red hover:to-picc-red text-white shadow-sm hover:shadow-md',
  ghost: 'text-picc-red hover:bg-warm-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
  outline: 'border-2 border-picc-red text-picc-red hover:bg-picc-red hover:text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-150 ease-elegant
    hover:scale-[0.96] active:scale-[0.94]
    focus:outline-none focus:ring-2 focus:ring-picc-red/40 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="h-4 w-4" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && !loading && <Icon className="h-4 w-4" />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClassName} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

export default Button;
