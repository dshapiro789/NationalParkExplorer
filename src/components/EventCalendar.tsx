import React from 'react';
import { Calendar, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Event } from '../types';
import { format, isSameDay, parseISO } from 'date-fns';

interface EventCalendarProps {
  events: Event[];
}

function EventCalendar({ events }: EventCalendarProps) {
  const sortedEvents = [...events].sort((a, b) => 
    parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
  );

  const groupEventsByDate = () => {
    return sortedEvents.reduce((acc: Record<string, Event[]>, event) => {
      const date = format(parseISO(event.startDate), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
  };

  const groupedEvents = groupEventsByDate();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-green-600" />
        Upcoming Events
      </h3>

      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-2 border-b">
            <h4 className="font-medium text-green-800">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </h4>
          </div>

          <div className="divide-y">
            {dayEvents.map(event => (
              <div key={event.id} className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{event.title}</h5>
                  {event.isPaid && (
                    <span className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {event.cost}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {event.times.join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>

                  {event.capacity && (
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Capacity: {event.capacity} people</span>
                    </div>
                  )}

                  {event.registration.required && (
                    <div className="flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Registration required</span>
                    </div>
                  )}
                </div>

                {event.registration.required && event.registration.url && (
                  <a
                    href={event.registration.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    Register Now →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No upcoming events scheduled</p>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;