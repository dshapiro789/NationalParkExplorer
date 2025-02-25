import React from 'react';
import { Heart } from 'lucide-react';
import { Park } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

interface FavoriteButtonProps {
  park: Park;
  className?: string;
}

export default function FavoriteButton({ park, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(user?.id);
  const isFavorited = isFavorite(park.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    toggleFavorite({ park, isFavorite: isFavorited });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={`
        group relative p-3 rounded-full transition-colors
        ${isFavorited
          ? 'bg-red-50/90 hover:bg-red-100/90 backdrop-blur-sm'
          : 'bg-white/90 hover:bg-gray-50/90 backdrop-blur-sm'
        }
        ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`h-7 w-7 transition-all duration-200 ${
          isFavorited
            ? 'fill-red-500 text-red-500 scale-110'
            : 'fill-none text-gray-600 group-hover:text-red-500'
        }`}
      />
    </button>
  );
}