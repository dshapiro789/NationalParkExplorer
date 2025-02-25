import React, { useState } from 'react';
import { Map, Activity, ChevronDown, Compass } from 'lucide-react';
import { UserPreferences } from '../types';
import { STATES } from '../data/states';

const ACTIVITIES = [
  { 
    id: 'hiking', 
    name: 'Hiking & Trails', 
    description: 'Explore hiking trails, walking paths, and nature walks' 
  },
  { 
    id: 'camping', 
    name: 'Camping', 
    description: 'Tent camping, RV sites, and backcountry camping' 
  },
  { 
    id: 'scenic', 
    name: 'Scenic Views', 
    description: 'Scenic viewpoints, photography spots, and natural landmarks' 
  }
];

interface ParkFormProps {
  onSearch: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

function ParkForm({ onSearch, isLoading }: ParkFormProps) {
  const [state, setState] = useState<string>('');
  const [activities, setActivities] = useState<string[]>([]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    if (newState && activities.length > 0) {
      onSearch({ state: newState, activities });
    }
  };

  const toggleActivity = (activityId: string) => {
    const newActivities = activities.includes(activityId)
      ? activities.filter(a => a !== activityId)
      : [...activities, activityId];
    setActivities(newActivities);
    
    if (state && newActivities.length > 0) {
      onSearch({ state, activities: newActivities });
    }
  };

  return (
    <div className="space-y-8">
      {/* Start Exploring Card */}
      <div className="bg-white rounded-lg shadow-xl p-6 text-center">
        <Compass className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Start Exploring</h2>
        <p className="text-gray-600">
          Select a state and your interests below to discover national parks that match your preferences.
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2 text-gray-700 mb-2">
          <Map className="h-5 w-5" />
          <span className="font-medium">Select Your State</span>
        </label>
        <div className="relative">
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full pl-4 pr-10 py-3 appearance-none bg-white border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                     text-gray-700 cursor-pointer transition-colors hover:border-gray-400"
          >
            <option value="" className="text-gray-500">Choose a state...</option>
            {STATES.map(state => (
              <option 
                key={state.code} 
                value={state.code}
                className="py-2"
              >
                {state.name} ({state.code})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 text-gray-700 mb-3">
          <Activity className="h-5 w-5" />
          <span className="font-medium">What interests you?</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {ACTIVITIES.map(activity => (
            <label
              key={activity.id}
              className={`
                flex items-start p-4 border rounded-lg cursor-pointer transition-all
                ${activities.includes(activity.id)
                  ? 'bg-green-50 border-green-500 shadow-sm'
                  : 'hover:bg-gray-50 border-gray-200'}
              `}
            >
              <input
                type="checkbox"
                checked={activities.includes(activity.id)}
                onChange={() => toggleActivity(activity.id)}
                className="mt-1 rounded text-green-600 focus:ring-green-500"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{activity.name}</div>
                <div className="text-sm text-gray-500">{activity.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-600 animate-pulse">
          Discovering parks for you...
        </div>
      )}
    </div>
  );
}

export default ParkForm;