import React from 'react';
import { useQuery } from 'react-query';
import { Award, Calendar, MapPin, Loader2 } from 'lucide-react';
import { UserPreferences, Park } from '../types';
import { getParks, generateRangerChallenge, matchesActivity } from '../services/npsApi';
import { STATES } from '../data/states';
import ParkMap from './ParkMap';

interface ItineraryProps {
  preferences: UserPreferences;
}

function Itinerary({ preferences }: ItineraryProps) {
  const stateName = STATES.find(s => s.code === preferences.state)?.name;

  const { data: parks, isLoading, error } = useQuery(
    ['parks', preferences.state],
    () => getParks(preferences.state),
    {
      select: (parks) => {
        return parks
          .filter(park => 
            preferences.activities.every(activity =>
              matchesActivity(park.activities, activity)
            )
          )
          .slice(0, preferences.duration);
      },
      staleTime: 300000, // Cache for 5 minutes
      retry: 2
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading parks</p>
        <p className="text-sm mt-1">Please try again or adjust your search criteria.</p>
      </div>
    );
  }

  if (!parks?.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="font-semibold text-yellow-800">No matching parks found</p>
        <p className="text-sm text-yellow-700 mt-1">
          Try selecting different activities or a different state. Some activities might not be available in all parks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-semibold text-green-800 flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Trip Summary</span>
        </h3>
        <div className="mt-2 text-sm text-gray-600">
          <p>State: {stateName} ({preferences.state})</p>
          <p>Duration: {preferences.duration} days</p>
          <p>Activities: {preferences.activities.join(", ")}</p>
        </div>
      </div>

      <ParkMap parks={parks} />

      {parks.map((park: Park, index: number) => {
        const rangerChallenge = generateRangerChallenge(park);
        const parkActivities = park.activities
          .filter(activity => 
            preferences.activities.some(pref => 
              matchesActivity([activity], pref)
            )
          )
          .slice(0, 3);

        return (
          <div key={park.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {park.images.length > 0 && (
              <img
                src={park.images[0].url}
                alt={park.images[0].altText}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{park.name}</h3>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  Day {index + 1}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{park.description}</p>
              
              <div className="mt-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Available Activities</span>
                </h4>
                <ul className="mt-2 space-y-2">
                  {parkActivities.map((activity) => (
                    <li key={activity.id} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>{activity.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold flex items-center space-x-2 text-yellow-800">
                  <Award className="h-5 w-5" />
                  <span>Ranger Challenge</span>
                </h4>
                <p className="mt-2 text-yellow-900">{rangerChallenge.question}</p>
                <p className="mt-1 text-sm text-yellow-700">
                  Complete this challenge to earn {rangerChallenge.points} points!
                </p>
              </div>

              <a
                href={park.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-green-600 hover:text-green-700"
              >
                Visit Official Park Website →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Itinerary;