import axios from 'axios';

// WeatherAPI.com endpoint and key
const WEATHER_API_KEY = 'c67ffde26cb54c94967171324252402';
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

export async function getWeather(lat: string, lon: string): Promise<WeatherData> {
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: `${lat},${lon}`,
        days: 5,
        aqi: 'no'
      }
    });

    // Transform WeatherAPI.com response to match our interface
    return {
      current: {
        temp: response.data.current.temp_f,
        feels_like: response.data.current.feelslike_f,
        humidity: response.data.current.humidity,
        weather: [{
          main: response.data.current.condition.text,
          description: response.data.current.condition.text,
          icon: response.data.current.condition.icon
        }]
      },
      daily: response.data.forecast.forecastday.map((day: any) => ({
        dt: new Date(day.date).getTime() / 1000,
        temp: {
          min: day.day.mintemp_f,
          max: day.day.maxtemp_f
        },
        weather: [{
          main: day.day.condition.text,
          description: day.day.condition.text,
          icon: day.day.condition.icon
        }]
      }))
    };
  } catch (error) {
    let errorMessage = 'Failed to fetch weather data';
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = 'Weather service temporarily unavailable';
      } else if (error.response?.status === 429) {
        errorMessage = 'Weather service rate limit exceeded';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Weather service request timed out';
      }
      console.error('Weather API Error:', error.response?.status, error.message);
    }
    throw new Error(errorMessage);
  }
}