import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Park } from '../types';
import { Icon, LatLngBounds } from 'leaflet';
import { saveMapTile, getMapTile } from '../lib/db';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// State boundaries approximation
const STATE_BOUNDS: Record<string, [number, number, number, number]> = {
  AL: [30.1, -88.5, 35.0, -84.9],
  AK: [51.0, -180.0, 71.5, -130.0],
  AZ: [31.3, -114.8, 37.0, -109.0],
  AR: [33.0, -94.7, 36.5, -89.6],
  CA: [32.5, -124.4, 42.0, -114.1],
  CO: [37.0, -109.1, 41.0, -102.0],
  CT: [41.0, -73.7, 42.1, -71.8],
  DE: [38.4, -75.8, 39.8, -75.0],
  FL: [24.5, -87.6, 31.0, -80.0],
  GA: [30.4, -85.6, 35.0, -80.8],
  HI: [18.9, -160.2, 22.2, -154.8],
  ID: [42.0, -117.2, 49.0, -111.0],
  IL: [37.0, -91.5, 42.5, -87.5],
  IN: [37.8, -88.1, 41.8, -84.8],
  IA: [40.4, -96.6, 43.5, -90.1],
  KS: [37.0, -102.0, 40.0, -94.6],
  KY: [36.5, -89.6, 39.1, -81.9],
  LA: [29.0, -94.0, 33.0, -89.0],
  ME: [43.1, -71.1, 47.5, -66.9],
  MD: [38.0, -79.5, 39.7, -75.0],
  MA: [41.2, -73.5, 42.9, -69.9],
  MI: [41.7, -90.4, 48.3, -82.4],
  MN: [43.5, -97.2, 49.4, -89.5],
  MS: [30.2, -91.7, 35.0, -88.1],
  MO: [36.0, -95.8, 40.6, -89.1],
  MT: [44.4, -116.0, 49.0, -104.0],
  NE: [40.0, -104.1, 43.0, -95.3],
  NV: [35.0, -120.0, 42.0, -114.0],
  NH: [42.7, -72.6, 45.3, -70.7],
  NJ: [39.0, -75.6, 41.4, -73.9],
  NM: [31.3, -109.0, 37.0, -103.0],
  NY: [40.5, -79.8, 45.0, -71.8],
  NC: [33.8, -84.3, 36.6, -75.5],
  ND: [45.9, -104.0, 49.0, -96.6],
  OH: [38.4, -84.8, 42.0, -80.5],
  OK: [33.6, -103.0, 37.0, -94.4],
  OR: [42.0, -124.6, 46.3, -116.5],
  PA: [39.7, -80.5, 42.3, -74.7],
  RI: [41.1, -71.9, 42.0, -71.1],
  SC: [32.0, -83.4, 35.2, -78.5],
  SD: [42.5, -104.1, 45.9, -96.4],
  TN: [35.0, -90.3, 36.7, -81.6],
  TX: [25.8, -106.7, 36.5, -93.5],
  UT: [37.0, -114.0, 42.0, -109.0],
  VT: [42.7, -73.4, 45.0, -71.5],
  VA: [36.5, -83.7, 39.5, -75.2],
  WA: [45.5, -124.8, 49.0, -116.9],
  WV: [37.2, -82.6, 40.6, -77.7],
  WI: [42.5, -92.9, 47.1, -86.8],
  WY: [41.0, -111.1, 45.0, -104.0]
};

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom TileLayer that supports offline caching
const CachedTileLayer = () => {
  const isOffline = useOfflineStatus();

  useEffect(() => {
    // Monkey-patch Leaflet's tile loading
    const originalCreateTile = (L as any).TileLayer.prototype.createTile;
    (L as any).TileLayer.prototype.createTile = function (coords: any, done: Function) {
      const tile = originalCreateTile.call(this, coords, done);
      const url = this.getTileUrl(coords);

      // Try to load from cache first when offline
      if (isOffline) {
        getMapTile(url).then(blob => {
          if (blob) {
            tile.src = URL.createObjectURL(blob);
          }
        });
      } else {
        // Cache tiles for offline use
        fetch(url)
          .then(response => response.blob())
          .then(blob => saveMapTile(url, blob))
          .catch(console.error);
      }

      return tile;
    };
  }, [isOffline]);

  return (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
  );
};

interface ParkMapProps {
  parks: Park[];
}

function ParkMap({ parks }: ParkMapProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!parks.length) return null;

  // Filter out parks with invalid coordinates
  const validParks = parks.filter(park => {
    const lat = parseFloat(park.latitude);
    const lng = parseFloat(park.longitude);
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  });

  if (!validParks.length) return null;

  // Get the state code from the first park
  const stateCode = validParks[0].states.split(',')[0].trim();
  
  // Get state bounds
  const stateBounds = STATE_BOUNDS[stateCode];
  if (!stateBounds) return null;

  const [minLat, minLng, maxLat, maxLng] = stateBounds;
  const bounds = new LatLngBounds(
    [minLat, minLng],
    [maxLat, maxLng]
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
      >
        <span className="font-medium text-green-800">Interactive Park Map</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-green-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-green-600" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-[400px]' : 'h-0'
        } overflow-hidden`}
      >
        <MapContainer
          bounds={bounds}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <CachedTileLayer />
          {validParks.map((park) => (
            <Marker
              key={park.id}
              position={[parseFloat(park.latitude), parseFloat(park.longitude)]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold">{park.name}</h3>
                  <p className="mt-1">{park.description.slice(0, 100)}...</p>
                  <button
                    onClick={() => window.open(park.url, '_blank', 'noopener,noreferrer')}
                    className="text-green-600 hover:text-green-700 mt-2 inline-flex items-center text-sm"
                  >
                    Visit Website →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default ParkMap;