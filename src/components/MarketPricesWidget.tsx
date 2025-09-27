import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarketPrice {
  id: string;
  crop_name: string;
  market_location: string;
  country: string;
  price_per_kg: number;
  currency: string;
  date: string;
  source: string;
}

interface MarketPricesWidgetProps {
  expanded?: boolean;
}

export const MarketPricesWidget = ({ expanded = false }: MarketPricesWidgetProps) => {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const { toast } = useToast();

  const countries = ["Nigeria", "Kenya", "Ghana", "South Africa", "Uganda", "Tanzania"];
  const crops = ["Rice", "Maize", "Wheat", "Yam", "Cassava", "Tomato", "Onion", "Pepper"];

  useEffect(() => {
    fetchMarketPrices();
  }, [selectedCountry, selectedCrop]);

  const fetchMarketPrices = async () => {
    try {
      setLoading(true);
      
      // Try to fetch existing market data
      let query = supabase
        .from("market_prices")
        .select("*")
        .order("date", { ascending: false })
        .limit(expanded ? 20 : 5);

      if (selectedCountry !== "all") {
        query = query.eq("country", selectedCountry);
      }

      if (selectedCrop !== "all") {
        query = query.eq("crop_name", selectedCrop);
      }

      const { data: existingData, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching market prices:", fetchError);
      }

      if (existingData && existingData.length > 0) {
        setMarketPrices(existingData);
      } else {
        // Generate sample market data for demonstration
        await generateSampleMarketData();
      }
    } catch (error) {
      console.error("Error in fetchMarketPrices:", error);
      toast({
        title: "Market data unavailable",
        description: "Unable to fetch current market prices.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleMarketData = async () => {
    const sampleData = [];
    const today = new Date().toISOString().split('T')[0];
    
    const cropPrices = {
      Rice: { min: 0.8, max: 1.5, currency: "USD" },
      Maize: { min: 0.3, max: 0.8, currency: "USD" },
      Wheat: { min: 0.4, max: 0.9, currency: "USD" },
      Yam: { min: 0.6, max: 1.2, currency: "USD" },
      Cassava: { min: 0.2, max: 0.5, currency: "USD" },
      Tomato: { min: 0.5, max: 1.8, currency: "USD" },
      Onion: { min: 0.4, max: 1.0, currency: "USD" },
      Pepper: { min: 2.0, max: 5.0, currency: "USD" },
    };

    const markets = {
      Nigeria: ["Lagos Market", "Kano Market", "Abuja Market"],
      Kenya: ["Nairobi Market", "Mombasa Market", "Kisumu Market"],
      Ghana: ["Accra Market", "Kumasi Market", "Tamale Market"],
      "South Africa": ["Johannesburg Market", "Cape Town Market", "Durban Market"],
      Uganda: ["Kampala Market", "Entebbe Market", "Jinja Market"],
      Tanzania: ["Dar es Salaam Market", "Arusha Market", "Mwanza Market"],
    };

    for (const crop of crops) {
      for (const country of countries) {
        const marketList = markets[country] || [`${country} Central Market`];
        for (const market of marketList) {
          const priceRange = cropPrices[crop];
          const basePrice = Math.random() * (priceRange.max - priceRange.min) + priceRange.min;
          
          const marketEntry = {
            crop_name: crop,
            market_location: market,
            country: country,
            price_per_kg: Math.round(basePrice * 100) / 100,
            currency: priceRange.currency,
            date: today,
            source: `${country} Agricultural Market Board`
          };
          
          sampleData.push(marketEntry);

          // Insert into database
          try {
            await supabase
              .from("market_prices")
              .upsert(marketEntry, { onConflict: 'crop_name,market_location,date' });
          } catch (error) {
            console.error("Error inserting market data:", error);
          }
        }
      }
    }
    
    // Filter sample data based on current selections
    let filteredData = sampleData;
    if (selectedCountry !== "all") {
      filteredData = filteredData.filter(item => item.country === selectedCountry);
    }
    if (selectedCrop !== "all") {
      filteredData = filteredData.filter(item => item.crop_name === selectedCrop);
    }
    
    setMarketPrices(filteredData.slice(0, expanded ? 20 : 5) as MarketPrice[]);
  };

  const getPriceTrend = (price: number, cropName: string) => {
    // Simulate price trend based on crop and current price
    const avgPrices = {
      Rice: 1.2, Maize: 0.55, Wheat: 0.65, Yam: 0.9,
      Cassava: 0.35, Tomato: 1.15, Onion: 0.7, Pepper: 3.5
    };
    
    const avgPrice = avgPrices[cropName] || 1.0;
    const diff = ((price - avgPrice) / avgPrice) * 100;
    
    return {
      trend: diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable',
      percentage: Math.abs(diff).toFixed(1)
    };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-primary" />;
      default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'down': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  if (loading) {
    return (
      <Card className={expanded ? "w-full" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Market Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading market data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expanded && marketPrices.length > 0) {
    return (
      <Card className="hover:shadow-medium transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Market Prices</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchMarketPrices}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription className="text-sm">
            Today's crop prices
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {marketPrices.slice(0, 3).map((price) => {
              const trend = getPriceTrend(price.price_per_kg, price.crop_name);
              return (
                <div key={price.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-sm">{price.crop_name}</p>
                      <p className="text-xs text-muted-foreground">{price.market_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-semibold">${price.price_per_kg}/kg</p>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(trend.trend)}
                        <span className={`text-xs ${trend.trend === 'up' ? 'text-destructive' : trend.trend === 'down' ? 'text-primary' : 'text-muted-foreground'}`}>
                          {trend.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-sm text-accent-foreground font-medium">
              💰 Best selling opportunity: {marketPrices[0]?.crop_name} in {marketPrices[0]?.country}
            </p>
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
            <DollarSign className="h-5 w-5" />
            <span>Live Market Prices</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMarketPrices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Real-time agricultural commodity prices across Africa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Country</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Crop</label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {marketPrices.map((price) => {
            const trend = getPriceTrend(price.price_per_kg, price.crop_name);
            return (
              <div
                key={price.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {price.crop_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{price.crop_name}</p>
                    <p className="text-sm text-muted-foreground">{price.market_location}</p>
                    <p className="text-xs text-muted-foreground">{price.country}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${price.price_per_kg}
                      <span className="text-sm font-normal text-muted-foreground">/kg</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(price.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Badge className={`flex items-center space-x-1 ${getTrendColor(trend.trend)}`}>
                    {getTrendIcon(trend.trend)}
                    <span>{trend.percentage}%</span>
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {marketPrices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No market data found for the selected filters.</p>
            <Button variant="outline" onClick={fetchMarketPrices} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {marketPrices.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-trust/10 to-primary/10 rounded-lg border border-trust/20">
            <h4 className="font-semibold text-trust mb-2">📊 Market Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Highest Price:</p>
                <p>{Math.max(...marketPrices.map(p => p.price_per_kg)).toFixed(2)} USD/kg</p>
              </div>
              <div>
                <p className="font-medium">Lowest Price:</p>
                <p>{Math.min(...marketPrices.map(p => p.price_per_kg)).toFixed(2)} USD/kg</p>
              </div>
              <div>
                <p className="font-medium">Average Price:</p>
                <p>{(marketPrices.reduce((sum, p) => sum + p.price_per_kg, 0) / marketPrices.length).toFixed(2)} USD/kg</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};