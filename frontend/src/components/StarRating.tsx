import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface StarRatingProps {
  productId: number; // Used for component identification in parent
  productName: string;
  initialRating?: number;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating(props: StarRatingProps) {
  const { productName, initialRating = 0, size = 'medium', readonly = false, onRatingChange } = props;
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const { darkMode } = useTheme();

  // Size configurations for easier clicking
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  // Padding for larger hit area
  const paddingClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-2.5',
  };

  const handleRatingClick = (value: number) => {
    if (readonly) {
      return;
    }
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (readonly) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRatingClick(value);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-1">
      <div
        className="flex items-center space-x-1"
        role="group"
        aria-label={`Rate ${productName}`}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isActive = value <= (hoverRating || rating);
          return (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => !readonly && setHoverRating(value)}
              onMouseLeave={() => !readonly && setHoverRating(0)}
              onKeyDown={(e) => handleKeyDown(e, value)}
              disabled={readonly}
              className={`
                ${paddingClasses[size]}
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
                rounded
              `}
              aria-label={`Rate ${value} out of 5 stars for ${productName}`}
              aria-pressed={value <= rating}
              tabIndex={readonly ? -1 : 0}
            >
              <svg
                className={`${sizeClasses[size]} transition-all duration-200`}
                fill={isActive ? '#76b852' : 'none'}
                stroke={isActive ? '#76b852' : darkMode ? '#9ca3af' : '#d1d5db'}
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {!readonly && rating > 0 && (
        <span
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
        >
          You rated this {rating} star{rating !== 1 ? 's' : ''}
        </span>
      )}
      {readonly && rating > 0 && (
        <span
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
        >
          {rating.toFixed(1)} out of 5 stars
        </span>
      )}
    </div>
  );
}
