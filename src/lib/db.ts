import { openDB, DBSchema } from 'idb';
import { Park, ParkMap } from '../types';

interface ParkDB extends DBSchema {
  parks: {
    key: string;
    value: Park;
    indexes: { 'by-state': string };
  };
  mapTiles: {
    key: string;
    value: Blob;
  };
  downloadedMaps: {
    key: string;
    value: {
      parkId: string;
      mapId: string;
      blob: Blob;
      downloadDate: number;
    };
    indexes: { 'by-park': string };
  };
}

const DB_NAME = 'park-adventure-planner';
const DB_VERSION = 2;

export const db = openDB<ParkDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const parkStore = db.createObjectStore('parks', { keyPath: 'id' });
      parkStore.createIndex('by-state', 'states');
      db.createObjectStore('mapTiles');
    }
    
    if (oldVersion < 2) {
      const mapStore = db.createObjectStore('downloadedMaps', { 
        keyPath: ['parkId', 'mapId'] 
      });
      mapStore.createIndex('by-park', 'parkId');
    }
  },
});

export async function savePark(park: Park) {
  const database = await db;
  await database.put('parks', park);
}

export async function saveParks(parks: Park[]) {
  const database = await db;
  const tx = database.transaction('parks', 'readwrite');
  await Promise.all([
    ...parks.map(park => tx.store.put(park)),
    tx.done
  ]);
}

export async function getPark(id: string): Promise<Park | undefined> {
  const database = await db;
  return database.get('parks', id);
}

export async function getParksForState(state: string): Promise<Park[]> {
  const database = await db;
  const parks = await database.getAllFromIndex('parks', 'by-state', state);
  return parks;
}

export async function saveMapTile(url: string, blob: Blob) {
  const database = await db;
  await database.put('mapTiles', blob, url);
}

export async function getMapTile(url: string): Promise<Blob | undefined> {
  const database = await db;
  return database.get('mapTiles', url);
}

export async function saveDownloadedMap(
  parkId: string,
  mapId: string,
  blob: Blob
) {
  const database = await db;
  await database.put('downloadedMaps', {
    parkId,
    mapId,
    blob,
    downloadDate: Date.now(),
  });
}

export async function getDownloadedMap(parkId: string, mapId: string) {
  const database = await db;
  return database.get('downloadedMaps', [parkId, mapId]);
}

export async function getDownloadedMapsByPark(parkId: string) {
  const database = await db;
  return database.getAllFromIndex('downloadedMaps', 'by-park', parkId);
}

export async function deleteDownloadedMap(parkId: string, mapId: string) {
  const database = await db;
  await database.delete('downloadedMaps', [parkId, mapId]);
}