import axios from "axios";
import { getCachedWeather, setCachedWeather } from "./db.ts";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface ForecastItem {
  time: string;
  temp: number;
  rain_prob: number;
  icon: string;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  rain_prob: number;
  aqi: number;
  city: string;
  forecast: ForecastItem[];
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_OPENWEATHER_API_KEY" || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING: Please add OPENWEATHER_API_KEY to the Secrets panel.");
  }

  // Check cache first
  const cached = getCachedWeather(lat, lon);
  if (cached) {
    return cached;
  }

  try {
    // Fetch current weather
    const weatherRes = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: apiKey.trim(),
        units: "metric",
      },
    });

    // Fetch AQI (Air Pollution API)
    const aqiRes = await axios.get(`${BASE_URL}/air_pollution`, {
      params: {
        lat,
        lon,
        appid: apiKey.trim(),
      },
    });

    // Fetch Forecast
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: apiKey.trim(),
        units: "metric",
      },
    });

    const data = weatherRes.data;
    const aqiData = aqiRes.data;
    const forecastData = forecastRes.data;

    const forecast: ForecastItem[] = forecastData.list.slice(0, 8).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: item.main.temp,
      rain_prob: item.pop * 100, // pop is probability of precipitation (0-1)
      icon: item.weather[0].icon,
    }));

    const result: WeatherData = {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed,
      rain_prob: data.rain ? (data.rain["1h"] || 0) : 0,
      aqi: aqiData.list[0].main.aqi,
      city: data.name,
      forecast,
    };

    // Save to cache
    setCachedWeather(lat, lon, result);

    return result;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("API_KEY_INVALID: The OpenWeather API key provided is invalid or not yet active. It can take up to 2 hours for new keys to activate.");
    }
    throw error;
  }
}

export async function getWeatherDataByCity(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_OPENWEATHER_API_KEY" || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING: Please add OPENWEATHER_API_KEY to the Secrets panel.");
  }

  try {
    // First get coordinates for the city
    const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: city,
        limit: 1,
        appid: apiKey.trim(),
      },
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      throw new Error(`City "${city}" not found.`);
    }

    const { lat, lon } = geoRes.data[0];
    return getWeatherData(lat, lon);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("API_KEY_INVALID: The OpenWeather API key provided is invalid or not yet active.");
    }
    throw error;
  }
}
