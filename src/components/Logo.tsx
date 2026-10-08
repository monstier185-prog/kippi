import type { CSSProperties } from 'react';

export type LogoVariant = 'horizontal' | 'mark' | 'mono' | 'reversed';

interface LogoProps {
  /** Which brand lockup to render. */
  variant?: LogoVariant;
  /** Rendered height in pixels; width scales to preserve aspect ratio. */
  height?: number;
  /** Accessible label. Set to empty string only when the logo is decorative. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * MyStreet.id brand logo.
 *
 * SVGs are inlined (rather than referenced via <img>) so that `currentColor`,
 * CSS, and the accessible <title> all work reliably across the app. The marks
 * use only the brand palette: deep navy, muted coral, and warm off-white. No
 * sparkles, robots, brains, neon, or other AI-slop symbols.
 */
export function Logo({
  variant = 'horizontal',
  height = 32,
  title = 'MyStreet.id',
  className,
  style,
}: LogoProps) {
  const labelled = title.length > 0;
  const a11y = labelled
    ? ({ role: 'img', 'aria-label': title } as const)
    : ({ 'aria-hidden': true, focusable: false } as const);

  const mark = (markTitle: boolean, roadFill: string) => (
    <>
      {markTitle && labelled ? <title>{title}</title> : null}
      <rect x={0} y={0} width={48} height={48} rx={11} fill="#132A44" />
      <path d="M11 10 L19 10 L13 38 L5 38 Z" fill="#F06A4F" />
      <g fill={roadFill}>
        <path d="M24 12 L40 12 L38.4 18 L22.4 18 Z" />
        <path d="M22.8 21 L36 21 L34.4 27 L21.2 27 Z" />
        <path d="M21.6 30 L38 30 L36.4 36 L20 36 Z" />
      </g>
    </>
  );

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 48 48"
        height={height}
        width={height}
        className={className}
        style={style}
        {...a11y}
      >
        {mark(true, '#F7F3ED')}
      </svg>
    );
  }

  const wordNavy = variant === 'reversed' ? '#F7F3ED' : '#132A44';
  const wordAccent = variant === 'mono' ? wordNavy : '#F06A4F';
  const markTileNavy = variant === 'reversed';
  const roadFill = variant === 'reversed' ? '#132A44' : '#F7F3ED';

  return (
    <svg
      viewBox="0 0 220 48"
      height={height}
      width={(220 / 48) * height}
      className={className}
      style={style}
      {...a11y}
    >
      {labelled ? <title>{title}</title> : null}
      {markTileNavy ? (
        <>
          <rect x={0} y={0} width={48} height={48} rx={11} fill="#F7F3ED" />
          <path d="M11 10 L19 10 L13 38 L5 38 Z" fill="#F06A4F" />
          <g fill={roadFill}>
            <path d="M24 12 L40 12 L38.4 18 L22.4 18 Z" />
            <path d="M22.8 21 L36 21 L34.4 27 L21.2 27 Z" />
            <path d="M21.6 30 L38 30 L36.4 36 L20 36 Z" />
          </g>
        </>
      ) : (
        mark(false, roadFill)
      )}
      <text
        x={60}
        y={33}
        fontFamily="var(--font-sans, Inter, system-ui, sans-serif)"
        fontSize={26}
        fontWeight={700}
        letterSpacing={-0.4}
      >
        <tspan fill={wordNavy}>MyStreet</tspan>
        <tspan fill={wordAccent}>.id</tspan>
      </text>
    </svg>
  );
}

export default Logo;
