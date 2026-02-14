import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

type CardVariant = 'default' | 'accent' | 'gradient' | 'interactive' | 'glass';
type AccentColor = 'blue' | 'teal' | 'purple' | 'pink' | 'amber' | 'green' | 'red' | 'picc-red' | 'picc-ochre' | 'sage';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  accentColor?: AccentColor;
  href?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const accentColors: Record<AccentColor, string> = {
  blue: 'border-l-4 border-l-picc-red',
  teal: 'border-l-4 border-l-picc-ochre',
  purple: 'border-l-4 border-l-picc-ochre',
  pink: 'border-l-4 border-l-picc-red',
  amber: 'border-l-4 border-l-picc-ochre',
  green: 'border-l-4 border-l-sage-600',
  red: 'border-l-4 border-l-red-600',
  'picc-red': 'border-l-4 border-l-picc-red',
  'picc-ochre': 'border-l-4 border-l-picc-ochre',
  sage: 'border-l-4 border-l-sage-600',
};

const gradientColors: Record<AccentColor, string> = {
  blue: 'bg-gradient-to-br from-warm-50 to-picc-ochre-50 border-warm-200',
  teal: 'bg-gradient-to-br from-picc-ochre-50 to-sage-50 border-picc-ochre-200',
  purple: 'bg-gradient-to-br from-warm-100 to-warm-50 border-warm-200',
  pink: 'bg-gradient-to-br from-warm-50 to-picc-red-50 border-picc-red-200',
  amber: 'bg-gradient-to-br from-picc-ochre-50 to-orange-50 border-picc-ochre-200',
  green: 'bg-gradient-to-br from-sage-50 to-picc-ochre-50 border-sage-200',
  red: 'bg-gradient-to-br from-red-50 to-warm-50 border-red-200',
  'picc-red': 'bg-gradient-to-br from-picc-red-50 to-warm-50 border-picc-red-200',
  'picc-ochre': 'bg-gradient-to-br from-picc-ochre-50 to-warm-50 border-picc-ochre-200',
  sage: 'bg-gradient-to-br from-sage-50 to-picc-ochre-50 border-sage-200',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  accentColor = 'blue',
  href,
  className = '',
  padding = 'md',
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-2xl border transition-all duration-300 ease-elegant';

  const variantStyles = {
    default: 'bg-white shadow-sm border-gray-100',
    accent: `bg-white shadow-sm border-gray-100 ${accentColors[accentColor]}`,
    gradient: `${gradientColors[accentColor]} border`,
    interactive: 'bg-white shadow-sm border-gray-100 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
    glass: 'bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20',
  };

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link href={href} className={`block ${combinedClassName}`}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div className={combinedClassName} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return <div className={combinedClassName}>{children}</div>;
}

export function CardHeader({
  children,
  icon: Icon,
  iconColor = 'text-picc-red',
  action,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({
  children,
  as: Component = 'h3',
  className = '',
}: CardTitleProps) {
  return (
    <Component className={`font-bold text-gray-900 ${className}`}>
      {children}
    </Component>
  );
}

export function CardDescription({
  children,
  className = '',
}: CardDescriptionProps) {
  return <p className={`text-gray-600 text-sm ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = '',
}: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
