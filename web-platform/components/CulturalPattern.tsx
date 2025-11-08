'use client';

interface CulturalPatternProps {
  variant?: 'dots' | 'waves' | 'circles';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  className?: string;
}

export default function CulturalPattern({
  variant = 'dots',
  position = 'top-right',
  opacity = 0.05,
  className = ''
}: CulturalPatternProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-0 right-0';
    }
  };

  const getPattern = () => {
    switch (variant) {
      case 'dots':
        return (
          <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full">
            {[...Array(8)].map((_, i) =>
              [...Array(8)].map((_, j) => (
                <circle
                  key={`${i}-${j}`}
                  cx={50 + i * 50}
                  cy={50 + j * 50}
                  r="4"
                  fill="currentColor"
                  className="text-palm-600"
                />
              ))
            )}
          </svg>
        );

      case 'waves':
        return (
          <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full">
            <path
              d="M0,200 Q50,150 100,200 T200,200 T300,200 T400,200"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-palm-600"
            />
            <path
              d="M0,250 Q50,200 100,250 T200,250 T300,250 T400,250"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-palm-600"
            />
            <path
              d="M0,300 Q50,250 100,300 T200,300 T300,300 T400,300"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-palm-600"
            />
          </svg>
        );

      case 'circles':
        return (
          <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full">
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="2" fill="none" className="text-palm-600" />
            <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="2" fill="none" className="text-palm-600" />
            <circle cx="200" cy="200" r="50" stroke="currentColor" strokeWidth="2" fill="none" className="text-palm-600" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute pointer-events-none ${getPositionClasses()} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="w-64 h-64 md:w-96 md:h-96">
        {getPattern()}
      </div>
    </div>
  );
}
