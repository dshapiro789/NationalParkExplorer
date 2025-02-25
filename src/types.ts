import { Database } from './types/supabase';

export interface Park {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
  states: string;
  images: ParkImage[];
  url: string;
  latitude: string;
  longitude: string;
  operatingHours: OperatingHours[];
  entranceFees: EntranceFee[];
  entrancePasses: EntranceFee[];
  accessibility: Accessibility;
  amenities: Amenity[];
  visitorCenters: VisitorCenter[];
  nearbyAccommodations: Accommodation[];
  trails: Trail[];
  events: Event[];
  maps: ParkMap[];
}

export interface ParkMap {
  id: string;
  title: string;
  url: string;
  type: 'visitor' | 'trail' | 'campground' | 'overview';
  fileSize: string;
  lastUpdated: string;
  description?: string;
}

export interface Activity {
  id: string;
  name: string;
}

export interface ParkImage {
  url: string;
  altText: string;
  title: string;
}

export interface UserPreferences {
  state: string;
  activities: string[];
}

export interface StateOption {
  code: string;
  name: string;
}

export interface OperatingHours {
  name: string;
  description: string;
  standardHours: {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
  };
  exceptions: {
    name: string;
    startDate: string;
    endDate: string;
    hours: {
      sunday: string;
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
    };
  }[];
}

export interface EntranceFee {
  cost: string;
  description: string;
  title: string;
}

export interface Accessibility {
  wheelchairAccess: string;
  internetInfo: string;
  cellPhoneInfo: string;
  rvInfo: string;
  trailAccessibility: TrailAccessibility[];
}

export interface TrailAccessibility {
  trailName: string;
  wheelchairAccessible: boolean;
  accessibilityFeatures: string[];
  restrictions: string[];
}

export interface Amenity {
  name: string;
  description: string;
  category: string;
}

export interface VisitorCenter {
  id: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  url: string;
}

export interface Accommodation {
  name: string;
  type: string;
  description: string;
  distance: string;
  url?: string;
}

export interface Trail {
  id: string;
  name: string;
  description: string;
  length: number;
  difficulty: 'easy' | 'moderate' | 'strenuous' | 'expert';
  elevation: {
    gain: number;
    start: number;
    peak: number;
  };
  type: 'loop' | 'out-and-back' | 'point-to-point';
  surface: string;
  seasonalClosures: string[];
  features: string[];
  accessibility: TrailAccessibility;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  times: string[];
  category: string;
  isPaid: boolean;
  cost?: string;
  registration: {
    required: boolean;
    url?: string;
    deadline?: string;
  };
  capacity?: number;
  ageGroups: string[];
}