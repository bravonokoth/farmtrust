import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  id: string;
  location: string;
  date: string;
  temperature_min: number;
  temperature_max: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  conditions: string;
  forecast: any;
}

interface WeatherWidgetProps {
  expanded?: boolean;
}

export const WeatherWidget = ({ expanded = false }: WeatherWidgetProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Lagos, Nigeria");
  const { toast } = useToast();

  useEffect(() => {
    fetchWeatherData();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("location")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile?.location) {
          setUserLocation(profile.location);
        }
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // First, try to fetch existing weather data
      const { data: existingData, error: fetchError } = await supabase
        .from("weather_data")
        .select("*")
        .gte("date", new Date().toISOString().split('T')[0])
        .order("date", { ascending: true })
        .limit(expanded ? 7 : 1);

      if (fetchError) {
        console.error("Error fetching weather data:", fetchError);
      }

      if (existingData && existingData.length > 0) {
        setWeatherData(existingData);
      } else {
        // Generate sample weather data for demonstration
        await generateSampleWeatherData();
      }
    } catch (error) {
      console.error("Error in fetchWeatherData:", error);
      toast({
        title: "Weather data unavailable",
        description: "Unable to fetch current weather information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleWeatherData = async () => {
    const sampleData = [];
    const today = new Date();
    
    for (let i = 0; i < (expanded ? 7 : 1); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const weatherEntry = {
        location: userLocation,
        date: date.toISOString().split('T')[0],
        temperature_min: Math.floor(Math.random() * 10) + 20, // 20-30°C
        temperature_max: Math.floor(Math.random() * 10) + 30, // 30-40°C
        humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
        precipitation: Math.floor(Math.random() * 20), // 0-20mm
        wind_speed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        conditions: ['sunny', 'partly_cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
        forecast: {
          advice: i === 0 ? "Good day for planting. Soil moisture is optimal." : "Monitor crop growth conditions.",
        }
      };
      
      sampleData.push(weatherEntry);

      // Insert into database
      try {
        await supabase
          .from("weather_data")
          .upsert(weatherEntry, { onConflict: 'location,date' });
      } catch (error) {
        console.error("Error inserting weather data:", error);
      }
    }
    
    setWeatherData(sampleData as WeatherData[]);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-accent" />;
      case 'partly_cloudy': return <Cloud className="h-6 w-6 text-muted-foreground" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-muted-foreground" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-trust" />;
      default: return <Sun className="h-6 w-6 text-accent" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'partly_cloudy': return 'bg-muted text-muted-foreground border-border';
      case 'cloudy': return 'bg-muted text-muted-foreground border-border';
      case 'rainy': return 'bg-trust/10 text-trust-foreground border-trust/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <Card className={expanded ? "w-full" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Weather Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentWeather = weatherData[0];

  if (!expanded && currentWeather) {
    return (
      <Card className="hover:shadow-medium transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              {getWeatherIcon(currentWeather.conditions)}
              <span>Today's Weather</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchWeatherData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription className="text-sm">
            {currentWeather.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Temperature</span>
              </div>
              <span className="font-semibold">
                {currentWeather.temperature_min}°C - {currentWeather.temperature_max}°C
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-trust" />
                <span className="text-sm font-medium">Humidity</span>
              </div>
              <span>{currentWeather.humidity}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wind</span>
              </div>
              <span>{currentWeather.wind_speed} km/h</span>
            </div>

            <Badge className={`w-full justify-center ${getConditionColor(currentWeather.conditions)}`}>
              {currentWeather.conditions.replace('_', ' ').toUpperCase()}
            </Badge>

            {currentWeather.forecast?.advice && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-primary font-medium">
                  💡 Farming Tip: {currentWeather.forecast.advice}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>7-Day Weather Forecast</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchWeatherData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>{userLocation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {weatherData.map((weather, index) => (
            <div
              key={weather.id || index}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getWeatherIcon(weather.conditions)}
                <div>
                  <p className="font-medium">
                    {index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     new Date(weather.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    }
                  </p>
                  <Badge className={`text-xs ${getConditionColor(weather.conditions)}`}>
                    {weather.conditions.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Temp</p>
                  <p className="font-semibold">{weather.temperature_min}°-{weather.temperature_max}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Rain</p>
                  <p className="font-semibold">{weather.precipitation}mm</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Wind</p>
                  <p className="font-semibold">{weather.wind_speed}km/h</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {weatherData.length > 0 && weatherData[0].forecast?.advice && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">🌾 Farming Recommendations</h4>
            <p className="text-sm text-foreground">
              {weatherData[0].forecast.advice}
            </p>
            <ul className="mt-3 text-sm text-muted-foreground space-y-1">
              <li>• Best planting time: Early morning (6-8 AM)</li>
              <li>• Irrigation: {weatherData[0].precipitation > 10 ? 'Not needed today' : 'Recommended in evening'}</li>
              <li>• Pest control: {weatherData[0].humidity > 80 ? 'Monitor for fungal diseases' : 'Good conditions'}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};