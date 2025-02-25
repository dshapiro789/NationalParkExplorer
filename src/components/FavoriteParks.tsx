import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import ParkResults from './ParkResults';

export default function FavoriteParks() {
  const { user } = useAuth();
  const { favorites, isLoading } = useFavorites(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Favorite Parks Yet
        </h3>
        <p className="text-gray-600">
          Start exploring parks and save your favorites to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <Heart className="h-6 w-6 text-red-500 mr-2" />
        Your Favorite Parks
      </h2>
      <ParkResults
        parks={favorites}
        isLoading={false}
        error={null}
        preferences={null}
      />
    </div>
  );
}