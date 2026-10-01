// PayChamps wordmark — "Medal C" (direction 1e)
// Requires Space Grotesk 700 (Google Fonts / next/font).
type Props = { theme?: 'light' | 'dark'; size?: number; className?: string };

const COLORS = {
  light: { ink: '#1D2230', gold: '#B8892B' },
  dark: { ink: '#F8F7F3', gold: '#E2B85A' },
};

export function Logo({ theme = 'light', size = 32, className }: Props) {
  const { ink, gold } = COLORS[theme];
  return (
    <span
      role="img"
      aria-label="PayChamps"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.045em',
        lineHeight: 1,
        color: ink,
      }}
    >
      <span aria-hidden>Pay</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        style={{ width: '0.72em', height: '0.72em', margin: '0 -0.01em 0 0.01em', transform: 'translateY(0.04em)' }}
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke={ink} strokeWidth="4.2" strokeDasharray="47 9.5" transform="rotate(30 12 12)" />
        <circle cx="12" cy="12" r="3.4" fill={gold} />
      </svg>
      <span aria-hidden>hamps</span>
    </span>
  );
}

export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="PayChamps">
      <rect width="120" height="120" rx="26" fill="#1D2230" />
      <g transform="translate(26 26) scale(2.8333)">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#F8F7F3" strokeWidth="4.2" strokeDasharray="47 9.5" transform="rotate(30 12 12)" />
        <circle cx="12" cy="12" r="3.4" fill="#E2B85A" />
      </g>
    </svg>
  );
}
