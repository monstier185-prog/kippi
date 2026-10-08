import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  /** Rounds fully for avatar-style placeholders. */
  circle?: boolean;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A content placeholder for loading states. It is `aria-hidden` because it
 * conveys no information; the surrounding region should expose a loading label.
 */
export function Skeleton({ width, height, circle, className }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : undefined,
  };
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
