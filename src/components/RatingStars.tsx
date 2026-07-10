import { Star } from 'lucide-react';
import './RatingStars.css';

interface RatingStarsProps {
  value: number;
  onChange: (stars: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rating-star${n <= value ? ' on' : ''}`}
          onClick={() => onChange(n)}
          aria-label={String(n)}
        >
          <Star size={26} strokeWidth={2} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
