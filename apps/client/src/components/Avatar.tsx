interface Props {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 62%, 52%)`;
}

export default function Avatar({ url, name, size = 36, className }: Props) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.42),
    lineHeight: `${size}px`
  };

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={['avatar', 'avatar-img', className].filter(Boolean).join(' ')}
        style={style}
      />
    );
  }

  return (
    <div
      className={['avatar', 'avatar-fallback', className].filter(Boolean).join(' ')}
      style={{ ...style, background: colorFromName(name || '?') }}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
