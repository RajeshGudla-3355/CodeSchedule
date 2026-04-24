interface Props {
  /** Size of the icon mark in px */
  iconSize?: number;
  /** Show the "Code / Schedule" stacked wordmark next to the icon */
  showWordmark?: boolean;
  /** Show the "LEARN · DAILY · GROW" tagline under the wordmark */
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  iconSize = 32,
  showWordmark = true,
  showTagline = false,
  className
}: Props) {
  return (
    <span
      className={['brand-logo', className].filter(Boolean).join(' ')}
      style={{ gap: Math.round(iconSize * 0.28) }}
    >
      <LogoMark size={iconSize} />
      {showWordmark && (
        <span className="brand-wordmark">
          <span
            className="brand-wordmark-stack"
            style={{ fontSize: Math.round(iconSize * 0.4) }}
          >
            <span className="brand-word brand-word-dark">Code</span>
            <span className="brand-word brand-word-purple">Schedule</span>
          </span>
          {showTagline && <span className="brand-tagline">LEARN · DAILY · GROW</span>}
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CodeSchedule"
      role="img"
    >
      <defs>
        <linearGradient id="cs-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Rounded purple square */}
      <rect x="4" y="4" width="56" height="56" rx="13" fill="url(#cs-body)" />

      {/* Binder ring stems (short vertical pins above the card body) */}
      <rect x="20.75" y="9" width="2.5" height="7" rx="1.2" fill="rgba(255,255,255,0.45)" />
      <rect x="40.75" y="9" width="2.5" height="7" rx="1.2" fill="rgba(255,255,255,0.45)" />
      {/* Binder ring heads */}
      <circle cx="22" cy="9" r="2.6" fill="rgba(255,255,255,0.8)" />
      <circle cx="42" cy="9" r="2.6" fill="rgba(255,255,255,0.8)" />

      {/* Inner card outline */}
      <rect
        x="11"
        y="13"
        width="42"
        height="40"
        rx="4"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.9"
      />

      {/* Card header band — clipped bottom so only the top is rounded */}
      <path
        d="M 11 17 A 4 4 0 0 1 15 13 H 49 A 4 4 0 0 1 53 17 V 22 H 11 Z"
        fill="rgba(255,255,255,0.32)"
      />

      {/* Content bars (3 rows, mixed widths) */}
      <rect x="16" y="28" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />
      <rect x="31" y="28" width="17" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />

      <rect x="16" y="35" width="20" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />
      <rect x="39" y="35" width="9" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />

      <rect x="16" y="42" width="10" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />
      <rect x="29" y="42" width="15" height="3" rx="1.5" fill="#ffffff" opacity="0.92" />

      {/* Checkmark badge in the bottom-right */}
      <circle cx="50" cy="50" r="9" fill="#ffffff" />
      <path
        d="M45.6 50.2 L48.8 53.4 L54.6 47.3"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
