import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** 'default' uses glass-card, 'soft' uses lighter glass, 'flat' uses white bg with border */
  variant?: 'default' | 'soft' | 'flat';
  /** Extra padding override */
  padding?: string;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
}

/**
 * Reusable glassmorphism card.
 * Replaces repeated bg-card/bg-white + border + shadow-sm patterns.
 */
export function GlassCard({
  children,
  className = '',
  variant = 'default',
  padding,
  onClick,
  as: Tag = 'div',
}: GlassCardProps) {
  const variantClass =
    variant === 'soft'
      ? 'bg-white/50 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl'
      : variant === 'flat'
      ? 'bg-white/80 border border-white/40 shadow-md rounded-2xl'
      : 'glass-card';

  return (
    <Tag
      className={`${variantClass} ${padding ?? 'p-5'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
