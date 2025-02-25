import axios from 'axios';
import { Park, Activity } from '../types';

const API_KEY = '0Xr4P8BopP0jIncQpdt1wvMfYq3Xv1hx7G86Us3C';
const BASE_URL = 'https://developer.nps.gov/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY
  }
});

const ACTIVITY_MAPPING: Record<string, string[]> = {
  'hiking': [
    'Hiking',
    'Walking',
    'Day Hiking',
    'Backcountry Hiking',
    'Front-Country Hiking',
    'Trail Hiking',
    'Nature Trails',
    'Walking',
    'Hiking - Front-Country',
    'Hiking - Backcountry'
  ],
  'camping': [
    'Camping',
    'Backcountry Camping',
    'Car or Front Country Camping',
    'RV Camping',
    'Tent Camping',
    'Group Camping',
    'Primitive Camping'
  ],
  'scenic': [
    'Scenic Driving',
    'Photography',
    'Scenic Views',
    'Sunset Viewing',
    'Landscape Photography',
    'Stargazing',
    'Sunrise Viewing',
    'Vista Points',
    'Overlooks',
    'Auto Touring',
    'Astronomy'
  ]
};

export async function getParks(stateCode: string): Promise<Park[]> {
  try {
    const response = await api.get('/parks', {
      params: {
        stateCode: stateCode.toUpperCase(),
        limit: 50
      }
    });

    return response.data.data
      .filter((park: any) => {
        const parkStates = park.states.split(',').map((s: string) => s.trim());
        return parkStates.length === 1 && parkStates[0] === stateCode.toUpperCase();
      })
      .map((park: any) => ({
        id: park.id,
        name: park.fullName,
        description: park.description,
        activities: park.activities?.map((activity: any) => ({
          ...activity,
          description: park.description
        })) || [],
        states: park.states,
        images: park.images || [],
        url: park.url,
        latitude: park.latitude,
        longitude: park.longitude,
        operatingHours: park.operatingHours || [],
        entranceFees: park.entranceFees || [],
        entrancePasses: park.entrancePasses || [],
        accessibility: {
          wheelchairAccess: park.accessibility?.wheelchairAccess || '',
          internetInfo: park.accessibility?.internetInfo || '',
          cellPhoneInfo: park.accessibility?.cellPhoneInfo || '',
          rvInfo: park.accessibility?.rvInfo || '',
          trailAccessibility: []
        },
        amenities: [],
        visitorCenters: park.visitorCenters || [],
        nearbyAccommodations: [],
        trails: [],
        events: [],
        maps: [
          {
            id: 'visitor-map',
            title: 'Visitor Guide Map',
            type: 'visitor',
            url: `${park.url}/planyourvisit/maps.htm`,
            fileSize: '2.5 MB',
            lastUpdated: new Date().toISOString(),
            description: 'Complete visitor guide with points of interest and facilities'
          },
          {
            id: 'trail-map',
            title: 'Trail System Map',
            type: 'trail',
            url: `${park.url}/planyourvisit/trails.htm`,
            fileSize: '3.8 MB',
            lastUpdated: new Date().toISOString(),
            description: 'Detailed trail map with distances and difficulty ratings'
          }
        ]
      }));
  } catch (error) {
    console.error('Error fetching parks:', error);
    throw new Error('Failed to fetch parks. Please try again.');
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const response = await api.get('/activities');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw new Error('Failed to fetch activities. Please try again.');
  }
}

export const matchesActivity = (parkActivities: Activity[], selectedActivity: string): boolean => {
  const mappedActivities = ACTIVITY_MAPPING[selectedActivity] || [selectedActivity];
  
  return mappedActivities.some(mappedActivity =>
    parkActivities.some(parkActivity =>
      parkActivity.name.toLowerCase().includes(mappedActivity.toLowerCase())
    )
  );
};

export const generateRangerChallenge = (park: Park) => ({
  question: `Can you identify three different types of trails in ${park.name}?`,
  points: 50
});