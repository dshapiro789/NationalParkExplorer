import React from 'react';
import { Mountain, ArrowUpRight, Route, AlertTriangle, Armchair as Wheelchair } from 'lucide-react';
import { Trail } from '../types';

interface TrailInfoProps {
  trail: Trail;
}

function TrailInfo({ trail }: TrailInfoProps) {
  const getDifficultyColor = (difficulty: Trail['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      case 'strenuous':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-lg">{trail.name}</h4>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(trail.difficulty)}`}>
          {trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{trail.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Length</p>
            <p className="text-sm text-gray-600">{trail.length} miles</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Mountain className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Elevation Gain</p>
            <p className="text-sm text-gray-600">{trail.elevation.gain}ft</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ArrowUpRight className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Peak Elevation</p>
            <p className="text-sm text-gray-600">{trail.elevation.peak}ft</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {trail.seasonalClosures.length > 0 && (
          <div className="flex items-start space-x-2 bg-yellow-50 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-yellow-800">Seasonal Closures</p>
              <ul className="mt-1 text-sm text-yellow-700">
                {trail.seasonalClosures.map((closure, index) => (
                  <li key={index}>{closure}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {trail.accessibility.wheelchairAccessible && (
          <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-md">
            <Wheelchair className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-800">Wheelchair Accessible</p>
              <ul className="mt-1 text-sm text-blue-700">
                {trail.accessibility.accessibilityFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {trail.features.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">Trail Features</p>
            <div className="flex flex-wrap gap-2">
              {trail.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrailInfo;