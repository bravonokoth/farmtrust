'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }>;
}

const WEATHER_CODE_ICON: Record<number, React.ReactNode> = {
  0: <Sun className="h-5 w-5" />,
  1: <Sun className="h-5 w-5" />,
  2: <Cloud className="h-5 w-5" />,
  3: <Cloud className="h-5 w-5" />,
  45: <Cloud className="h-5 w-5" />,
  48: <Cloud className="h-5 w-5" />,
  51: <CloudRain className="h-5 w-5" />,
  53: <CloudRain className="h-5 w-5" />,
  55: <CloudRain className="h-5 w-5" />,
  61: <CloudRain className="h-5 w-5" />,
  63: <CloudRain className="h-5 w-5" />,
  65: <CloudRain className="h-5 w-5" />,
  71: <CloudSnow className="h-5 w-5" />,
  73: <CloudSnow className="h-5 w-5" />,
  75: <CloudSnow className="h-5 w-5" />,
};

const getWeatherDescription = (code: number): string => {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Snow fall',
    75: 'Heavy snow',
  };
  return map[code] ?? 'Unknown';
};

const CACHE_KEY = 'weather_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  lat: number;
  lon: number;
}

export const WeatherTab = ({ expanded = false }: { expanded?: boolean }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  // ---- 1. Get coordinates -------------------------------------------------
  const getCoordinates = useCallback(async (): Promise<{ lat: number; lon: number; name: string } | null> => {
    // a) Try profile location (city name)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.location) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(profile.location)}&count=1&language=en&format=json`
        );
        const geoJson = await geoRes.json();
        if (geoJson.results?.[0]) {
          const { latitude, longitude, name, admin1 } = geoJson.results[0];
          return { lat: latitude, lon: longitude, name: `${name}, ${admin1}` };
        }
      }
    }

    // b) Fallback → HTML5 Geolocation
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve({ lat: latitude, lon: longitude, name: 'Your Location' });
        },
        () => resolve(null),
        { timeout: 8000 }
      );
    });
  }, []);

  // ---- 2. Fetch weather ----------------------------------------------------
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    const cache: CachedWeather | null = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    const now = Date.now();

    if (cache && cache.lat === lat && cache.lon === lon && now - cache.timestamp < CACHE_TTL) {
      setWeather(cache.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      if (!res.ok) throw new Error('Failed to fetch weather');

      const json = await res.json();

      const data: WeatherData = {
        current: {
          temperature: Math.round(json.current.temperature_2m),
          weatherCode: json.current.weather_code,
          windSpeed: Math.round(json.current.wind_speed_10m),
          humidity: json.current.relative_humidity_2m,
        },
        daily: json.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: Math.round(json.daily.temperature_2m_max[i]),
          tempMin: Math.round(json.daily.temperature_2m_min[i]),
          weatherCode: json.daily.weather_code[i],
        })),
      };

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: now, lat, lon } satisfies CachedWeather)
      );

      setWeather(data);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- 3. Main effect -------------------------------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const coords = await getCoordinates();
      if (!coords) {
        setError('Unable to determine your location. Please set a location in your profile.');
        setLoading(false);
        return;
      }

      setLocationName(coords.name);
      await fetchWeather(coords.lat, coords.lon);
    })();
  }, [getCoordinates, fetchWeather]);

  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          {expanded && <Skeleton className="h-32 w-full" />}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const currentIcon = WEATHER_CODE_ICON[weather.current.weatherCode] ?? <Cloud className="h-5 w-5" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather {locationName && `- ${locationName}`}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">{currentIcon}</div>
            <div>
              <p className="text-3xl font-bold">{weather.current.temperature}°C</p>
              <p className="text-sm text-muted-foreground">
                {getWeatherDescription(weather.current.weatherCode)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weather.current.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>{weather.current.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Forecast – only when expanded */}
        {expanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weather.daily.slice(0, 7).map((day) => {
              const icon = WEATHER_CODE_ICON[day.weatherCode] ?? <Cloud className="h-5 w-5" />;
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center p-2 bg-muted/50 rounded-lg text-center"
                >
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(day.date), 'EEE')}
                  </p>
                  <div className="my-1">{icon}</div>
                  <p className="text-sm font-medium">
                    {day.tempMax}° / {day.tempMin}°
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};