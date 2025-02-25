import React, { useState } from 'react';
import { MapPin, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Park, UserPreferences } from '../types';
import { matchesActivity } from '../services/npsApi';
import ParkMap from './ParkMap';
import WeatherInfo from './WeatherInfo';
import ParkDetails from './ParkDetails';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../hooks/useAuth';

interface ParkResultsProps {
  parks: Park[] | undefined;
  isLoading: boolean;
  error: unknown;
  preferences: UserPreferences | null;
}

export default function ParkResults({ parks, isLoading, error, preferences }: ParkResultsProps) {
  const [expandedPark, setExpandedPark] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const toggleCard = (parkId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parkId)) {
        newSet.delete(parkId);
      } else {
        newSet.add(parkId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 text-center">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Discovering parks for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">Unable to load parks</h3>
        <p className="text-red-600">
          Please try again or adjust your search criteria.
        </p>
      </div>
    );
  }

  const filteredParks = preferences
    ? parks?.filter(park => 
        preferences.activities.some(activity =>
          matchesActivity(park.activities, activity)
        )
      )
    : parks;

  if (!filteredParks?.length && preferences) {
    return (
      <div className="bg-yellow-50 rounded-lg shadow-xl p-6">
        <h3 className="text-yellow-800 font-semibold mb-2">No parks found</h3>
        <p className="text-yellow-700">
          Try selecting different activities or another state.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ParkMap parks={filteredParks || []} />
      
      <div className="grid gap-6">
        {filteredParks?.map(park => (
          <div key={park.id} className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="relative">
              {park.images.length > 0 && (
                <img
                  src={park.images[0].url}
                  alt={park.images[0].altText}
                  className="w-full h-64 object-cover"
                />
              )}
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-4">
                {user && (
                  <div className="mb-3">
                    <FavoriteButton
                      park={park}
                      className="shadow-xl"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between w-full">
                  <h3 className="text-xl font-semibold text-gray-900">{park.name}</h3>
                  <button
                    onClick={() => window.open(park.url, '_blank', 'noopener,noreferrer')}
                    className="text-green-600 hover:text-green-700 flex items-center"
                  >
                    <span className="text-sm">Visit</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{park.states}</span>
              </div>

              <div className={`transition-all duration-300 overflow-hidden ${
                collapsedCards.has(park.id) ? 'max-h-0' : 'max-h-[2000px]'
              }`}>
                <p className="mt-4 text-gray-600">{park.description}</p>

                <WeatherInfo
                  latitude={park.latitude}
                  longitude={park.longitude}
                  parkName={park.name}
                />

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Available Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {park.activities
                      .filter(activity => 
                        !preferences || preferences.activities.some(selectedActivity => 
                          matchesActivity([activity], selectedActivity)
                        )
                      )
                      .map(activity => (
                        <span
                          key={activity.id}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                        >
                          {activity.name}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 mt-6">
                <button
                  onClick={() => toggleCard(park.id)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                >
                  <span>{collapsedCards.has(park.id) ? 'Show Details' : 'Hide Details'}</span>
                  {collapsedCards.has(park.id) ? (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  )}
                </button>

                {!collapsedCards.has(park.id) && (
                  <button
                    onClick={() => setExpandedPark(expandedPark === park.id ? null : park.id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                  >
                    <span>{expandedPark === park.id ? 'Show Less' : 'Show More Details'}</span>
                    {expandedPark === park.id ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </button>
                )}
              </div>

              {expandedPark === park.id && !collapsedCards.has(park.id) && (
                <div className="mt-6 border-t pt-6">
                  <ParkDetails park={park} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}