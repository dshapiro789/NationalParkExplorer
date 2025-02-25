import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTrips } from '../../hooks/useTrips';
import { Trip, ChecklistItem } from '../../types';
import { format, parseISO, isValid } from 'date-fns';

export default function TripPlanner() {
  const { user } = useAuth();
  const {
    trips,
    isLoading,
    createTrip,
    updateTrip,
    deleteTrip,
    addChecklist,
    updateChecklist,
    deleteChecklist
  } = useTrips(user?.id);

  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when starting to edit
  useEffect(() => {
    if (editingTrip && trips) {
      const trip = trips.find(t => t.id === editingTrip);
      if (trip) {
        setFormData({
          title: trip.title,
          startDate: formatDateForInput(trip.startDate),
          endDate: formatDateForInput(trip.endDate)
        });
      }
    } else {
      setFormData({
        title: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [editingTrip, trips]);

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
    } catch {
      return '';
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'No date set';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await createTrip.mutateAsync({
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      setFormData({
        title: '',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      setError('Failed to create trip. Please try again.');
    }
  };

  const handleUpdateTrip = async (trip: Trip) => {
    setError(null);
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await updateTrip.mutateAsync({
        id: trip.id,
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      setEditingTrip(null);
      setFormData({
        title: '',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      setError('Failed to update trip. Please try again.');
    }
  };

  const handleAddChecklist = async (tripId: string) => {
    setError(null);
    const title = prompt('Enter checklist title:');
    if (!title) return;

    try {
      await addChecklist.mutateAsync({
        tripId,
        title,
        items: []
      });
    } catch (error) {
      console.error('Error adding checklist:', error);
      setError('Failed to add checklist. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setFormData({
      title: '',
      startDate: '',
      endDate: ''
    });
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-6 w-6 text-green-600 mr-2" />
          Trip Planner
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleCreateTrip} className="bg-white p-4 rounded-lg border space-y-4">
        <h3 className="font-medium text-gray-900">Create New Trip</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Trip Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Trip
        </button>
      </form>

      <div className="space-y-4">
        {trips?.map((trip) => (
          <div key={trip.id} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start mb-4">
              {editingTrip === trip.id ? (
                <div className="space-y-2 w-full">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 w-full"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateTrip(trip)}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{trip.title}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDateForDisplay(trip.startDate)} - {formatDateForDisplay(trip.endDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTrip(trip.id)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTrip.mutate(trip.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">Checklists</h4>
                  <button
                    onClick={() => handleAddChecklist(trip.id)}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Checklist
                  </button>
                </div>
                <div className="space-y-4">
                  {trip.checklists?.map((checklist) => (
                    <div key={checklist.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{checklist.title}</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteChecklist.mutate(checklist.id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {checklist.items.map((item: ChecklistItem) => (
                          <div key={item.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {
                                const updatedItems = checklist.items.map(i =>
                                  i.id === item.id ? { ...i, completed: !i.completed } : i
                                );
                                updateChecklist.mutate({
                                  id: checklist.id,
                                  items: updatedItems
                                });
                              }}
                              className="rounded text-green-600 focus:ring-green-500"
                            />
                            <span className={item.completed ? 'line-through text-gray-500' : ''}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const text = prompt('Enter new item:');
                            if (text) {
                              const newItem: ChecklistItem = {
                                id: crypto.randomUUID(),
                                text,
                                completed: false
                              };
                              updateChecklist.mutate({
                                id: checklist.id,
                                items: [...checklist.items, newItem]
                              });
                            }
                          }}
                          className="text-sm text-green-600 hover:text-green-700 flex items-center mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!trips?.length && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trips Planned</h3>
            <p className="text-gray-600">
              Start planning your next adventure by creating a new trip!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}