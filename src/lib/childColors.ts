import { ALL_CHILDREN, type Child } from '../types/data';

/** Every child's color for an "الكل" (all-children) item, or the single
 * matching child's color otherwise — feeds `dotBackground` to render either
 * a solid dot or a combined multi-color one. */
export function colorsForChildId(childId: string, children: Child[]): string[] {
  if (childId === ALL_CHILDREN) return children.map((c) => c.color);
  const match = children.find((c) => c.id === childId);
  return match ? [match.color] : [];
}

/** A solid color for one child, an even pie-wedge conic-gradient for several
 * (rendered on a small `border-radius: 50%` dot), or the muted fallback. */
export function dotBackground(colors: string[]): string {
  if (colors.length === 0) return 'var(--muted)';
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  return `conic-gradient(${colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ')})`;
}
