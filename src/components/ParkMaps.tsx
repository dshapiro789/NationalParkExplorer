import React, { useState } from 'react';
import { Download, Trash2, FileDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Park, ParkMap } from '../types';
import { saveDownloadedMap, getDownloadedMap, deleteDownloadedMap } from '../lib/db';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface ParkMapsProps {
  park: Park;
}

export default function ParkMaps({ park }: ParkMapsProps) {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [downloadedMaps, setDownloadedMaps] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const isOffline = useOfflineStatus();

  // Check which maps are already downloaded
  React.useEffect(() => {
    park.maps.forEach(async (map) => {
      try {
        const downloaded = await getDownloadedMap(park.id, map.id);
        setDownloadedMaps(prev => ({
          ...prev,
          [map.id]: !!downloaded
        }));
      } catch (err) {
        console.error('Error checking downloaded map:', err);
      }
    });
  }, [park.id, park.maps]);

  const handleDownload = async (map: ParkMap) => {
    setDownloading(prev => ({ ...prev, [map.id]: true }));
    setError(null);

    try {
      const response = await fetch(map.url);
      if (!response.ok) throw new Error('Failed to download map');
      
      const blob = await response.blob();
      await saveDownloadedMap(park.id, map.id, blob);
      
      setDownloadedMaps(prev => ({ ...prev, [map.id]: true }));
    } catch (err) {
      console.error('Error downloading map:', err);
      setError('Failed to download map. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [map.id]: false }));
    }
  };

  const handleDelete = async (map: ParkMap) => {
    try {
      await deleteDownloadedMap(park.id, map.id);
      setDownloadedMaps(prev => ({ ...prev, [map.id]: false }));
    } catch (err) {
      console.error('Error deleting map:', err);
      setError('Failed to delete map. Please try again.');
    }
  };

  const openMap = async (map: ParkMap) => {
    try {
      const downloadedMap = await getDownloadedMap(park.id, map.id);
      if (downloadedMap) {
        const url = URL.createObjectURL(downloadedMap.blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error opening map:', err);
      setError('Failed to open map. Please try again.');
    }
  };

  if (!park.maps?.length) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FileDown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No downloadable maps available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {park.maps.map((map) => (
          <div
            key={map.id}
            className="bg-white rounded-lg border p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{map.title}</h4>
              {map.description && (
                <p className="text-sm text-gray-600 mt-1">{map.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{map.type}</span>
                <span>{map.fileSize}</span>
                <span>Updated: {new Date(map.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {downloadedMaps[map.id] ? (
                <>
                  <button
                    onClick={() => openMap(map)}
                    disabled={!downloadedMaps[map.id]}
                    className="px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    View Offline
                  </button>
                  <button
                    onClick={() => handleDelete(map)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-md"
                    title="Delete downloaded map"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleDownload(map)}
                  disabled={downloading[map.id] || isOffline}
                  className={`
                    px-3 py-2 rounded-md flex items-center
                    ${isOffline
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
                  `}
                >
                  {downloading[map.id] ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}