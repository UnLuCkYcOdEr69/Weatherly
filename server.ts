import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getWeatherData, getWeatherDataByCity } from "./server/weatherService.ts";
import { getInsights } from "./server/insightEngine.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API Routes
  app.get("/api/weather", async (req, res) => {
    const { lat, lon, city } = req.query;
    
    try {
      let weather;
      if (lat && lon) {
        weather = await getWeatherData(Number(lat), Number(lon));
      } else if (city) {
        weather = await getWeatherDataByCity(String(city));
      } else {
        return res.status(400).json({ error: "Latitude/Longitude or City is required" });
      }

      const insights = getInsights(weather);
      res.json({ weather, insights });
    } catch (error: any) {
      console.error("Weather API Error:", error.message);
      const message = error.response?.data?.message || error.message || "Failed to fetch weather data";
      res.status(error.response?.status || 500).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
