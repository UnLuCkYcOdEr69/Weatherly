import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../../weather_cache.db"));

// Initialize cache table
db.exec(`
  CREATE TABLE IF NOT EXISTS weather_cache (
    id TEXT PRIMARY KEY,
    lat REAL,
    lon REAL,
    data TEXT,
    timestamp INTEGER
  )
`);

export interface CacheEntry {
  id: string;
  lat: number;
  lon: number;
  data: string;
  timestamp: number;
}

export function getCachedWeather(lat: number, lon: number): any | null {
  const id = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const row = db.prepare("SELECT * FROM weather_cache WHERE id = ?").get(id) as CacheEntry | undefined;

  if (row) {
    const now = Date.now();
    const age = now - row.timestamp;
    // Cache for 15 minutes
    if (age < 15 * 60 * 1000) {
      return JSON.parse(row.data);
    }
  }
  return null;
}

export function setCachedWeather(lat: number, lon: number, data: any) {
  const id = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const timestamp = Date.now();
  db.prepare("INSERT OR REPLACE INTO weather_cache (id, lat, lon, data, timestamp) VALUES (?, ?, ?, ?, ?)")
    .run(id, lat, lon, JSON.stringify(data), timestamp);
}
