export type TechKey = 'javascript' | 'python' | 'typescript' | 'react' | 'css';

interface Props {
  tech: TechKey;
  size?: number;
}

export default function TechIcon({ tech, size = 72 }: Props) {
  switch (tech) {
    case 'javascript':
      return <JavaScriptIcon size={size} />;
    case 'python':
      return <PythonIcon size={size} />;
    case 'typescript':
      return <TypeScriptIcon size={size} />;
    case 'react':
      return <ReactIcon size={size} />;
    case 'css':
      return <CssIcon size={size} />;
    default:
      return null;
  }
}

/* JavaScript: yellow rounded square with bold JS wordmark */
function JavaScriptIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="JavaScript">
      <rect width="64" height="64" rx="12" fill="#f7df1e" />
      <text
        x="60"
        y="52"
        textAnchor="end"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#1a1a1a"
        letterSpacing="-0.5"
      >
        JS
      </text>
    </svg>
  );
}

/* TypeScript: blue rounded square with white TS wordmark */
function TypeScriptIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="TypeScript">
      <rect width="64" height="64" rx="12" fill="#3178c6" />
      <text
        x="60"
        y="52"
        textAnchor="end"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        TS
      </text>
    </svg>
  );
}

/* Python: official two-snake logo (blue top, yellow bottom) */
function PythonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Python">
      <rect width="64" height="64" rx="12" fill="#ffffff" />
      <g transform="translate(10 10) scale(1.833)">
        <defs>
          <linearGradient id="py-blue" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#5A9FD4" />
            <stop offset="1" stopColor="#306998" />
          </linearGradient>
          <linearGradient id="py-yellow" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#FFE873" />
            <stop offset="1" stopColor="#FFD43B" />
          </linearGradient>
        </defs>
        <path
          fill="url(#py-blue)"
          d="M11.914 0a5.55 5.55 0 0 0-.926.079c-2.43.432-2.871 1.335-2.871 3.002V5h5.75v1h-8.1c-1.671 0-3.134 1.005-3.595 2.933-.533 2.208-.556 3.585 0 5.906.41 1.707 1.383 2.933 3.054 2.933h1.973v-2.6c0-1.874 1.634-3.533 3.595-3.533h5.682c1.602 0 2.878-1.308 2.878-2.933V3.08c0-1.561-1.318-2.733-2.878-2.99A17.914 17.914 0 0 0 11.914 0zM8.82 1.742c.595 0 1.08.488 1.08 1.089 0 .598-.485 1.082-1.08 1.082-.597 0-1.078-.484-1.078-1.082-.002-.601.481-1.089 1.078-1.089z"
        />
        <path
          fill="url(#py-yellow)"
          d="M20.078 6h-1.973v2.533c0 1.955-1.666 3.6-3.595 3.6H8.828c-1.582 0-2.878 1.34-2.878 2.933v5.533c0 1.561 1.365 2.48 2.878 2.933 1.814.542 3.559.64 5.682 0 1.441-.433 2.878-1.304 2.878-2.933V19h-5.749v-1h8.628c1.671 0 2.293-1.174 2.878-2.933.603-1.811.577-3.552 0-5.906-.418-1.69-1.204-2.933-2.878-2.933zm-3.234 14.441c.596 0 1.079.484 1.079 1.082 0 .601-.483 1.089-1.079 1.089-.595 0-1.078-.488-1.078-1.089 0-.598.483-1.082 1.078-1.082z"
        />
      </g>
    </svg>
  );
}

/* React: dark card with cyan atom orbital rings */
function ReactIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="React">
      <rect width="64" height="64" rx="12" fill="#20232a" />
      <g transform="translate(32 32)" stroke="#61dafb" strokeWidth="1.8" fill="none">
        <ellipse rx="22" ry="8.4" />
        <ellipse rx="22" ry="8.4" transform="rotate(60)" />
        <ellipse rx="22" ry="8.4" transform="rotate(120)" />
        <circle r="3.4" fill="#61dafb" stroke="none" />
      </g>
    </svg>
  );
}

/* CSS: blue shield-card with CSS stacked over 3 (like CSS3 badge) */
function CssIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="CSS">
      <defs>
        <linearGradient id="css-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2965f1" />
          <stop offset="100%" stopColor="#1f4bb8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#css-grad)" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="18"
        fontWeight="800"
        fill="#ffffff"
      >
        CSS
      </text>
      <text
        x="32"
        y="54"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#ffffff"
        opacity="0.85"
      >
        3
      </text>
    </svg>
  );
}
