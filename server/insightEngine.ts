import { WeatherData } from "./weatherService.ts";

export interface LifestyleInsights {
  scores: {
    laundry: number;
    outdoor: number;
    travel: number;
    exercise: number;
  };
  advice: string[];
  alerts: string[];
}

export function getInsights(weather: WeatherData): LifestyleInsights {
  const scores = {
    laundry: calculateLaundryScore(weather),
    outdoor: calculateOutdoorScore(weather),
    travel: calculateTravelScore(weather),
    exercise: calculateExerciseScore(weather),
  };

  const advice: string[] = [];
  const alerts: string[] = [];

  // Humidity logic
  if (weather.humidity > 80) {
    advice.push("It's quite sticky today. Stay hydrated and prefer cotton clothes.");
  }

  // Rain logic
  if (weather.rain_prob > 0.5 || weather.description.includes("rain")) {
    alerts.push("Rain expected soon. Don't forget your umbrella!");
    advice.push("Maybe a good day for indoor activities.");
  }

  // Heat logic
  if (weather.temp > 35) {
    alerts.push("Heatwave warning! Avoid direct sun exposure between 12 PM and 4 PM.");
  } else if (weather.temp > 30) {
    advice.push("Warm day ahead. Keep a water bottle handy.");
  }

  // AQI logic (1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor)
  if (weather.aqi >= 4) {
    alerts.push("Poor air quality. Wear a mask if heading outdoors.");
    advice.push("Sensitive groups should avoid prolonged outdoor exertion.");
  } else if (weather.aqi === 3) {
    advice.push("Moderate air quality. Fine for most, but keep an eye out.");
  }

  // General positive advice
  if (advice.length === 0 && alerts.length === 0) {
    advice.push("The weather looks pleasant! Great time for a quick walk.");
  }

  return { scores, advice, alerts };
}

function calculateLaundryScore(w: WeatherData): number {
  let score = 100;
  if (w.humidity > 70) score -= (w.humidity - 70) * 2;
  if (w.description.includes("rain")) score -= 80;
  if (w.temp < 20) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function calculateOutdoorScore(w: WeatherData): number {
  let score = 100;
  if (w.temp > 35) score -= (w.temp - 35) * 10;
  if (w.temp < 15) score -= (15 - w.temp) * 5;
  if (w.humidity > 80) score -= 20;
  if (w.aqi >= 4) score -= 50;
  if (w.description.includes("rain")) score -= 60;
  return Math.max(0, Math.min(100, score));
}

function calculateTravelScore(w: WeatherData): number {
  let score = 100;
  if (w.description.includes("rain")) score -= 40;
  if (w.temp > 38) score -= 30;
  if (w.wind_speed > 10) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function calculateExerciseScore(w: WeatherData): number {
  let score = 100;
  if (w.aqi >= 4) score -= 70;
  if (w.temp > 32) score -= 30;
  if (w.humidity > 85) score -= 20;
  if (w.description.includes("rain")) score -= 50;
  return Math.max(0, Math.min(100, score));
}
