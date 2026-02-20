'use client';

import Image from 'next/image';
import Link from 'next/link';

type LogoVariant = 'full' | 'icon' | 'horizontal' | 'text';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LogoTheme = 'light' | 'dark' | 'auto';

interface PICCLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  href?: string;
  className?: string;
  showSubtitle?: boolean;
}

const iconSizes: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

const textSizes: Record<LogoSize, { title: string; subtitle: string; community: string }> = {
  xs: { title: 'text-sm', subtitle: 'text-[8px]', community: 'text-[7px]' },
  sm: { title: 'text-base', subtitle: 'text-[9px]', community: 'text-[8px]' },
  md: { title: 'text-lg', subtitle: 'text-[10px]', community: 'text-[9px]' },
  lg: { title: 'text-xl', subtitle: 'text-xs', community: 'text-[10px]' },
  xl: { title: 'text-2xl', subtitle: 'text-sm', community: 'text-xs' },
};

export function PICCLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  href,
  className = '',
  showSubtitle = false,
}: PICCLogoProps) {
  const iconSize = iconSizes[size];
  const text = textSizes[size];

  const titleColor = theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-gray-900' : 'text-gray-900 dark:text-white';
  const subtitleColor = theme === 'dark' ? 'text-warm-200' : theme === 'light' ? 'text-gray-500' : 'text-gray-500 dark:text-warm-200';
  const communityColor = theme === 'dark' ? 'text-warm-300' : theme === 'light' ? 'text-picc-red' : 'text-picc-red dark:text-warm-300';

  const logoIcon = (
    <Image
      src="/logo/picc-logo-full.png"
      alt="PICC"
      width={iconSize}
      height={iconSize}
      className="object-contain"
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  );

  const logoText = (
    <div className={variant === 'full' ? 'text-center' : ''}>
      <div className={`${text.title} font-bold ${titleColor} tracking-tight leading-tight font-serif`}>
        Palm Island
      </div>
      <div className={`${text.community} ${communityColor} tracking-[0.2em] uppercase font-medium leading-tight`}>
        Community Company
      </div>
      {showSubtitle && (
        <div className={`${text.subtitle} ${subtitleColor} italic mt-0.5`}>
          Manbarra &amp; Bwgcolman Country
        </div>
      )}
    </div>
  );

  const content = (() => {
    switch (variant) {
      case 'icon':
        return (
          <div className={`flex items-center justify-center ${className}`}>
            {logoIcon}
          </div>
        );
      case 'text':
        return (
          <div className={`${className}`}>
            {logoText}
          </div>
        );
      case 'full':
        return (
          <div className={`flex flex-col items-center gap-2 ${className}`}>
            {logoIcon}
            {logoText}
          </div>
        );
      case 'horizontal':
      default:
        return (
          <div className={`flex items-center gap-2.5 ${className}`}>
            {logoIcon}
            {logoText}
          </div>
        );
    }
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
