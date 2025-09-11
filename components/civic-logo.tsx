"use client"

interface CivicLogoProps {
  className?: string
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

export default function CivicLogo({ className, onClick, size = "md" }: CivicLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
  }

  const finalClassName = className || sizeClasses[size]

  return (
    <div
      className={`flex items-center space-x-3 ${finalClassName} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={onClick}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.95" />
            <stop offset="100%" stopColor="white" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M20 2L8 6V17C8 26 13 34 20 36C27 34 32 26 32 17V6L20 2Z"
          fill="url(#primaryGradient)"
          className="drop-shadow-xl"
          filter="url(#glow)"
        />

        <circle cx="20" cy="20" r="15" fill="none" stroke="url(#accentGradient)" strokeWidth="0.5" opacity="0.3" />

        <rect x="12" y="22" width="3" height="10" fill="url(#buildingGradient)" rx="1" />
        <rect x="16" y="19" width="3.5" height="13" fill="url(#buildingGradient)" rx="1" />
        <rect x="20.5" y="21" width="3" height="11" fill="url(#buildingGradient)" rx="1" />
        <rect x="24.5" y="24" width="3" height="8" fill="url(#buildingGradient)" rx="1" />

        <rect x="12.5" y="24" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="14" y="24" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="12.5" y="27" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="14" y="27" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />

        <rect x="16.8" y="21" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="18.2" y="21" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="16.8" y="24" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="18.2" y="24" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />

        <rect x="21.2" y="23" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="22.6" y="23" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />

        <rect x="25.2" y="26" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />
        <rect x="26.6" y="26" width="0.6" height="1" fill="#3b82f6" rx="0.2" opacity="0.8" />

        <circle cx="20" cy="15" r="2" fill="white" opacity="0.9" />
        <circle cx="20" cy="15" r="1.2" fill="url(#accentGradient)" />

        <path d="M16 15L24 15" stroke="white" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
        <path d="M20 11L20 19" stroke="white" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col">
        <span className="text-xl font-bold leading-tight tracking-tight">
          <span className="text-blue-600 dark:text-blue-400">Civic</span>
          <span className="text-foreground ml-1 font-semibold">Sense</span>
        </span>
        <span className="text-xs text-muted-foreground font-medium tracking-widest -mt-0.5 uppercase opacity-80">
          Community • First
        </span>
      </div>
    </div>
  )
}
