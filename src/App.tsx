/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Shirt, 
  MapPin, 
  Bike, 
  Car, 
  Dumbbell,
  RefreshCw,
  Sun,
  Search,
  Navigation,
  CloudRain,
  CloudLightning,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  LabelList
} from 'recharts';

interface ForecastItem {
  time: string;
  temp: number;
  rain_prob: number;
  icon: string;
}

interface WeatherData {
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

interface LifestyleInsights {
  scores: {
    laundry: number;
    outdoor: number;
    travel: number;
    exercise: number;
  };
  advice: string[];
  alerts: string[];
}

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [insights, setInsights] = useState<LifestyleInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState("");

  const getBackgroundGradient = () => {
    if (!weather) return "from-[#0F172A] to-[#1E293B]";
    
    const code = weather.icon;
    const isNight = code.endsWith('n');
    
    // Professional, moody gradients - slightly darkened for better text contrast
    if (isNight) return "from-[#020617] via-[#0F172A] to-[#1E293B]";
    
    if (code.startsWith('01')) return "from-[#0369A1] via-[#0EA5E9] to-[#38BDF8]"; // Clear
    if (code.startsWith('02') || code.startsWith('03') || code.startsWith('04')) return "from-[#1E293B] via-[#334155] to-[#475569]"; // Clouds
    if (code.startsWith('09') || code.startsWith('10')) return "from-[#1E1B4B] via-[#312E81] to-[#4338CA]"; // Rain
    if (code.startsWith('11')) return "from-[#020617] via-[#1E1B4B] to-[#312E81]"; // Thunder
    if (code.startsWith('13')) return "from-[#334155] via-[#475569] to-[#94A3B8]"; // Snow
    if (code.startsWith('50')) return "from-[#1E293B] via-[#334155] to-[#475569]"; // Mist
    
    return "from-[#0369A1] to-[#0EA5E9]";
  };

  const fetchData = async (lat?: number, lon?: number, city?: string) => {
    try {
      setLoading(true);
      let url = "/api/weather?";
      if (lat !== undefined && lon !== undefined) {
        url += `lat=${lat}&lon=${lon}`;
      } else if (city) {
        url += `city=${encodeURIComponent(city)}`;
      } else {
        throw new Error("Location or city is required");
      }

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch weather data");
      
      setWeather(data.weather);
      setInsights(data.insights);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchData(undefined, undefined, searchCity.trim());
    }
  };

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setError("Location request timed out. Please ensure location is enabled and try again.");
      setLoading(false);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        fetchData(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error("Geolocation error:", err);
        setError("Please enable location access to get hyperlocal weather.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getAqiLabel = (aqi: number) => {
    const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    return labels[aqi - 1] || "Unknown";
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return "text-[#10B981]"; // Emerald
    if (score > 40) return "text-[#F59E0B]"; // Amber
    return "text-[#EF4444]"; // Rose
  };

  if (loading && !weather) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center font-sans text-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <Cloud className="w-10 h-10 text-sky-400" />
          </div>
        </motion.div>
        <p className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Syncing Atmosphere</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${getBackgroundGradient()} text-white font-sans selection:bg-white/20 overflow-x-hidden`}>
      <div className="fixed inset-0 bg-black/5 pointer-events-none" />
      
      <div className="relative z-10 max-w-xl mx-auto p-6 md:p-10 space-y-10">
        {/* iOS Style Header */}
        <header className="space-y-8">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-0.5"
            >
              <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
              <p className="text-white/50 text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {weather?.city || "Detecting..."}
              </p>
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={getLocation}
              className="w-12 h-12 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[1.25rem] flex items-center justify-center hover:bg-black/30 transition-all shadow-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>

          {/* iOS Spotlight Style Search */}
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCitySearch} 
            className="relative group"
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white/90 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for a city"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl py-4 pl-14 pr-16 focus:outline-none focus:bg-black/30 transition-all placeholder:text-white/40 text-lg font-medium shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-all backdrop-blur-md border border-white/10"
            >
              Go
            </button>
          </motion.form>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#EF4444]/10 backdrop-blur-xl border border-[#EF4444]/20 p-5 rounded-3xl flex items-start gap-4 text-rose-100"
          >
            <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Action Required</p>
              <p className="text-sm opacity-80 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {weather && insights && (
          <AnimatePresence mode="wait">
            <motion.div
              key={weather.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Main iOS Hero Card */}
              <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[2.75rem] p-10 shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="text-8xl font-bold tracking-tighter flex items-start drop-shadow-lg">
                        {Math.round(weather.temp)}<span className="text-4xl mt-3 font-medium opacity-60">°</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold capitalize drop-shadow-md">{weather.description}</div>
                        <div className="text-white/80 font-semibold drop-shadow-sm">Feels like {Math.round(weather.feels_like)}°</div>
                      </div>
                    </div>
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
                      <img 
                        src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                        alt="weather icon"
                        className="w-32 h-32 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] relative z-10"
                      />
                    </motion.div>
                  </div>

                  <div className="mt-10 space-y-4">
                    {insights.alerts?.map((alert, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex gap-4 items-center bg-[#EF4444]/15 text-rose-100 p-5 rounded-[1.75rem] text-sm font-semibold border border-[#EF4444]/10"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                        {alert}
                      </motion.div>
                    ))}
                    {insights.advice?.map((advice, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (insights.alerts.length + i) * 0.1 }}
                        key={i} 
                        className="flex gap-4 items-center bg-white/5 text-white/90 p-5 rounded-[1.75rem] text-sm font-medium border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        </div>
                        {advice}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Hourly Forecast Enhanced Graph */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">Hourly Forecast</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase">Temp</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-white/40 uppercase">Rain %</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 h-[22rem] shadow-2xl overflow-hidden relative group">
                  {/* Minimalist Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Atmospheric Pulse</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Temperature</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Rain Risk</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10">
                      <span className="text-[8px] font-bold text-sky-400 uppercase tracking-widest">24H Trend</span>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weather.forecast || []} margin={{ top: 25, right: 20, left: 20, bottom: 15 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" strokeDasharray="5 5" />
                      
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 700, letterSpacing: '0.05em' }}
                        dy={8}
                        interval={0}
                      />
                      
                      <YAxis 
                        yAxisId="left"
                        hide
                        domain={['dataMin - 5', 'dataMax + 10']} 
                      />
                      
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        hide
                        domain={[0, 100]}
                      />

                      {/* Rain Probability - Subtle Dots at bottom */}
                      <Bar 
                        yAxisId="right"
                        dataKey="rain_prob" 
                        barSize={30} 
                        fill="rgba(255,255,255,0.01)" 
                      >
                        <LabelList 
                          dataKey="rain_prob" 
                          content={(props: any) => {
                            const { x, width, value } = props;
                            return (
                              <g>
                                <text x={x + width / 2} y={265} fill="#38BDF8" fontSize={8} fontWeight={900} textAnchor="middle" opacity={value > 0 ? 0.8 : 0.3}>
                                  {Math.round(value)}%
                                </text>
                              </g>
                            );
                          }}
                        />
                      </Bar>

                      {/* Temperature Area - Spline for professional look */}
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#38BDF8" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorTemp)" 
                        animationDuration={1500}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          return (
                            <g key={`dot-${payload.time}`}>
                              {/* Weather Icon - Scaled down */}
                              <image 
                                x={cx - 10} 
                                y={cy - 40} 
                                width={20} 
                                height={20} 
                                href={`https://openweathermap.org/img/wn/${payload.icon}.png`}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', opacity: 0.8 }}
                              />
                              {/* Temp Label */}
                              <text 
                                x={cx} 
                                y={cy - 12} 
                                fill="#fff" 
                                fontSize={10} 
                                fontWeight={900} 
                                textAnchor="middle"
                                opacity={0.9}
                              >
                                {Math.round(payload.temp)}°
                              </text>
                              {/* Minimalist Dot */}
                              <circle cx={cx} cy={cy} r={2.5} fill="#38BDF8" stroke="#fff" strokeWidth={1} />
                            </g>
                          );
                        }}
                      />
                      
                      <Tooltip 
                        cursor={{ stroke: 'rgba(255,255,255,0.03)', strokeWidth: 20 }}
                        content={() => null}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Lifestyle Grid */}
              <div className="grid grid-cols-2 gap-5">
                <ScoreCard 
                  label="Laundry" 
                  score={insights.scores.laundry} 
                  icon={<Shirt className="w-5 h-5" />} 
                  color={getScoreColor(insights.scores.laundry)}
                  delay={0.1}
                />
                <ScoreCard 
                  label="Outdoor" 
                  score={insights.scores.outdoor} 
                  icon={<Bike className="w-5 h-5" />} 
                  color={getScoreColor(insights.scores.outdoor)}
                  delay={0.2}
                />
                <ScoreCard 
                  label="Travel" 
                  score={insights.scores.travel} 
                  icon={<Car className="w-5 h-5" />} 
                  color={getScoreColor(insights.scores.travel)}
                  delay={0.3}
                />
                <ScoreCard 
                  label="Exercise" 
                  score={insights.scores.exercise} 
                  icon={<Dumbbell className="w-5 h-5" />} 
                  color={getScoreColor(insights.scores.exercise)}
                  delay={0.4}
                />
              </div>

              {/* iOS Style Stats Bar */}
              <section className="bg-black/20 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.75rem] grid grid-cols-3 gap-8 shadow-xl">
                <StatItem 
                  label="Humidity" 
                  value={`${weather.humidity}%`} 
                  icon={<Droplets className="w-5 h-5 text-sky-400" />} 
                />
                <StatItem 
                  label="Wind" 
                  value={`${weather.wind_speed} m/s`} 
                  icon={<Wind className="w-5 h-5 text-slate-400" />} 
                />
                <StatItem 
                  label="AQI" 
                  value={getAqiLabel(weather.aqi)} 
                  icon={<Sun className="w-5 h-5 text-amber-400" />} 
                />
              </section>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, score, icon, color, delay }: { label: string, score: number, icon: React.ReactNode, color: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="bg-black/20 backdrop-blur-3xl p-7 rounded-[2.25rem] border border-white/10 flex flex-col items-center justify-center text-center space-y-4 group hover:bg-black/30 transition-all shadow-lg"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{label}</div>
        <div className={`text-4xl font-black tracking-tighter drop-shadow-sm ${color}`}>{Math.round(score)}%</div>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, delay: delay + 0.5, ease: "circOut" }}
          className={`h-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </motion.div>
  );
}

function StatItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-10 h-10 bg-white/10 rounded-[1rem] flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-[9px] font-black uppercase tracking-widest text-white/60">
          {label}
        </div>
        <div className="text-sm font-black text-white drop-shadow-sm">{value}</div>
      </div>
    </div>
  );
}



