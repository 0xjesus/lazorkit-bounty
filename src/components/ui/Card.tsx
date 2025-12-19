import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

/**
 * Card Component
 *
 * A reusable card with optional highlighting for featured content.
 */
export function Card({ children, className = '', highlighted = false }: CardProps) {
  const baseStyles =
    'relative rounded-2xl border p-6 transition-all duration-300';

  const normalStyles =
    'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80';

  const highlightedStyles =
    'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-transparent hover:border-violet-500/70 shadow-lg shadow-violet-500/10';

  return (
    <div
      className={`${baseStyles} ${highlighted ? highlightedStyles : normalStyles} ${className}`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
