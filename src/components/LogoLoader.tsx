import React from 'react';

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  text?: string;
  subtext?: string;
  className?: string;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 'md',
  text = 'Loading...',
  subtext = 'Skill2Career Career Architecture',
  className = '',
}) => {
  const isFullscreen = size === 'fullscreen';

  // Dimension scaling
  const logoDimensions = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    fullscreen: 'w-24 h-24 sm:w-28 sm:h-28',
  }[size];

  const ringDimensions = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    fullscreen: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  const containerPadding = isFullscreen
    ? 'min-h-screen py-16'
    : size === 'sm'
    ? 'py-4'
    : 'py-12';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center ${containerPadding} ${className}`}
    >
      {/* Animated Brand Container */}
      <div className="relative flex items-center justify-center">
        {/* Multicolored Radial Glow Aura matching S2C Brand Quadrants */}
        <div
          className={`absolute rounded-full filter blur-xl opacity-40 animate-pulse pointer-events-none ${ringDimensions}`}
          style={{
            background:
              'radial-gradient(circle at 30% 30%, #f97316 0%, #38bdf8 35%, #fbbf24 70%, #34d399 100%)',
          }}
          aria-hidden="true"
        />

        {/* Orbiting Gradient Ring */}
        <div
          className={`absolute rounded-full border-2 border-transparent border-t-amber-500 border-r-sky-500 border-b-emerald-500 border-l-orange-500 animate-spin ${ringDimensions}`}
          style={{ animationDuration: '2.4s' }}
          aria-hidden="true"
        />

        {/* Second Reverse Sub-Ring for Depth */}
        <div
          className={`absolute rounded-full border border-dashed border-slate-300 opacity-60 animate-spin ${ringDimensions}`}
          style={{ animationDuration: '8s', animationDirection: 'reverse' }}
          aria-hidden="true"
        />

        {/* Vibrant Glass Brand Emblem */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md p-2 shadow-xl border border-slate-200/80 animate-float-gentle overflow-hidden ${logoDimensions}`}
        >
          <img
            src="/logo.png"
            alt="Skill2Career Logo"
            className="w-full h-full object-contain filter drop-shadow-sm select-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('S2C.png')) {
                target.src = '/S2C.png';
              }
            }}
          />
        </div>
      </div>

      {/* Typography & Status Feedback */}
      {text && (
        <div className="mt-6 flex flex-col items-center text-center max-w-sm px-4">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{text}</span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </h3>

          {subtext && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtext}
            </p>
          )}

          {/* Micro Progress Bar */}
          <div className="w-36 sm:w-44 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden relative border border-slate-200/60">
            <div
              className="h-full rounded-full animate-progress-indeterminate"
              style={{
                background: 'linear-gradient(90deg, #f97316 0%, #0ea5e9 33%, #eab308 66%, #10b981 100%)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoLoader;
