import React from 'react';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { Cloud, Loader2, Sun, CloudRain, Thermometer, AlertTriangle } from 'lucide-react';
import { getWeather, WeatherData } from '../services/weatherApi';

interface WeatherInfoProps {
  latitude: string;
  longitude: string;
  parkName: string;
}

function WeatherInfo({ latitude, longitude, parkName }: WeatherInfoProps) {
  const { data: weather, isLoading, error } = useQuery<WeatherData>(
    ['weather', latitude, longitude],
    () => getWeather(latitude, longitude),
    {
      staleTime: 1800000, // 30 minutes
      retry: 2,
      retryDelay: 5000, // Wait 5 seconds between retries
      onError: (error) => {
        console.error('Weather fetch error:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            Weather information temporarily unavailable. Check back later for updates.
          </p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Thermometer className="h-5 w-5 mr-2 text-green-600" />
          Current Weather at {parkName}
        </h4>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            {getWeatherIcon(weather.current.weather[0].main)}
            <span className="ml-2 text-2xl font-semibold">
              {Math.round(weather.current.temp)}°F
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Feels like {Math.round(weather.current.feels_like)}°F
            </p>
            <p className="text-sm text-gray-600">
              Humidity: {weather.current.humidity}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">5-Day Forecast</h5>
        <div className="grid grid-cols-5 gap-2">
          {weather.daily.slice(0, 5).map((day) => (
            <div key={day.dt} className="text-center">
              <p className="text-xs text-gray-600">
                {format(day.dt * 1000, 'EEE')}
              </p>
              <div className="my-1">
                {getWeatherIcon(day.weather[0].main)}
              </div>
              <p className="text-xs">
                <span className="font-medium">{Math.round(day.temp.max)}°</span>
                <span className="text-gray-500 ml-1">{Math.round(day.temp.min)}°</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherInfo;