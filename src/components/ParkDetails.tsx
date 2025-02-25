import React, { useState } from 'react';
import { Clock, DollarSign, Armchair as Wheelchair, MapPin, Home, Info, Mountain, Calendar, FileDown } from 'lucide-react';
import { Park, OperatingHours } from '../types';
import { format } from 'date-fns';
import TrailInfo from './TrailInfo';
import EventCalendar from './EventCalendar';
import ParkMaps from './ParkMaps';

interface ParkDetailsProps {
  park: Park;
}

function ParkDetails({ park }: ParkDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'trails' | 'events' | 'maps'>('info');

  const formatHours = (hours: OperatingHours['standardHours']) => {
    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="grid grid-cols-2 gap-2">
        <span className="capitalize">{day}:</span>
        <span>{time || 'Closed'}</span>
      </div>
    ));
  };

  const currentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const tabs = [
    { id: 'info', label: 'General Info', icon: Info },
    { id: 'trails', label: 'Trails', icon: Mountain },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'maps', label: 'Maps', icon: FileDown }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="border-b overflow-x-auto">
        <nav className="flex space-x-4 min-w-max" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <>
          {/* Operating Hours */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Operating Hours
            </h3>
            {park.operatingHours.map((hours, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <h4 className="font-medium mb-2">{hours.name}</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1 text-sm">
                    {formatHours(hours.standardHours)}
                  </div>
                  {hours.exceptions.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Seasonal Changes</p>
                      {hours.exceptions.map((exception, i) => (
                        <div key={i} className="text-sm text-yellow-700">
                          <p className="font-medium">{exception.name}</p>
                          <p>
                            {format(new Date(exception.startDate), 'MMM d')} -{' '}
                            {format(new Date(exception.endDate), 'MMM d')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Entrance Fees */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Entrance Fees & Passes
            </h3>
            <div className="grid gap-4">
              {park.entranceFees.map((fee, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium">{fee.title}</h4>
                  <p className="text-xl sm:text-2xl font-bold text-green-700 my-2">${parseFloat(fee.cost).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{fee.description}</p>
                </div>
              ))}
            </div>
            {park.entrancePasses.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-3">Available Passes</h4>
                <div className="grid gap-3">
                  {park.entrancePasses.map((pass, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-md">
                      <p className="font-medium">{pass.title}</p>
                      <p className="text-green-700 font-bold">${parseFloat(pass.cost).toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-1">{pass.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Accessibility */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Wheelchair className="h-5 w-5 mr-2 text-green-600" />
              Accessibility Information
            </h3>
            <div className="space-y-4">
              {park.accessibility.wheelchairAccess && (
                <div>
                  <h4 className="font-medium mb-1">Wheelchair Access</h4>
                  <p className="text-gray-600">{park.accessibility.wheelchairAccess}</p>
                </div>
              )}
              {park.accessibility.internetInfo && (
                <div>
                  <h4 className="font-medium mb-1">Internet Access</h4>
                  <p className="text-gray-600">{park.accessibility.internetInfo}</p>
                </div>
              )}
              {park.accessibility.cellPhoneInfo && (
                <div>
                  <h4 className="font-medium mb-1">Cell Phone Service</h4>
                  <p className="text-gray-600">{park.accessibility.cellPhoneInfo}</p>
                </div>
              )}
              {park.accessibility.rvInfo && (
                <div>
                  <h4 className="font-medium mb-1">RV Information</h4>
                  <p className="text-gray-600">{park.accessibility.rvInfo}</p>
                </div>
              )}
            </div>
          </section>

          {/* Visitor Centers */}
          {park.visitorCenters.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Info className="h-5 w-5 mr-2 text-green-600" />
                Visitor Centers
              </h3>
              <div className="grid gap-4">
                {park.visitorCenters.map((center) => (
                  <div key={center.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium">{center.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{center.description}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="break-all">
                        {center.latitude}, {center.longitude}
                      </span>
                    </div>
                    {center.url && (
                      <a
                        href={center.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby Accommodations */}
          {park.nearbyAccommodations.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Home className="h-5 w-5 mr-2 text-green-600" />
                Nearby Accommodations
              </h3>
              <div className="grid gap-4">
                {park.nearbyAccommodations.map((accommodation, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h4 className="font-medium">{accommodation.name}</h4>
                        <p className="text-sm text-gray-500">{accommodation.type}</p>
                      </div>
                      <span className="text-sm text-gray-600 mt-1 sm:mt-0">{accommodation.distance}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{accommodation.description}</p>
                    {accommodation.url && (
                      <a
                        href={accommodation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block"
                      >
                        More Information →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seasonal Recommendations */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              {currentSeason()} Recommendations
            </h3>
            <div className="prose prose-green max-w-none">
              <p>
                Best time to visit during {currentSeason().toLowerCase()} is during{' '}
                {currentSeason() === 'Summer' ? 'early morning or evening' : 'midday'} when the weather is most favorable.
              </p>
              <ul className="mt-3 space-y-2">
                <li>Check trail conditions before heading out</li>
                <li>Bring appropriate gear for {currentSeason().toLowerCase()} weather</li>
                <li>Make reservations in advance for popular activities</li>
                <li>Follow park guidelines and safety recommendations</li>
              </ul>
            </div>
          </section>
        </>
      )}

      {activeTab === 'trails' && (
        <div className="space-y-4">
          {park.trails.length > 0 ? (
            park.trails.map(trail => (
              <TrailInfo key={trail.id} trail={trail} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No trail information available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <EventCalendar events={park.events} />
      )}

      {activeTab === 'maps' && (
        <ParkMaps park={park} />
      )}
    </div>
  );
}

export default ParkDetails;