import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, Plus, MapPin, Ruler, Leaf, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Farm {
  id: string;
  name: string;
  location: string;
  coordinates?: any;
  size_hectares: number;
  soil_type: string;
  crops: string[];
  created_at: string;
}

interface FarmMapWidgetProps {
  expanded?: boolean;
}

export const FarmMapWidget = ({ expanded = false }: FarmMapWidgetProps) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size_hectares: '',
    soil_type: '',
    crops: [] as string[]
  });
  const { toast } = useToast();

  const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Silt', 'Rocky', 'Organic'];
  const availableCrops = ['Rice', 'Maize', 'Wheat', 'Yam', 'Cassava', 'Tomato', 'Onion', 'Pepper', 'Cocoa', 'Palm'];

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) return;

      const { data: farmsData, error } = await supabase
        .from("farms")
        .select("*")
        .eq("farmer_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching farms:", error);
        toast({
          title: "Error loading farms",
          description: "Unable to fetch your farm data.",
          variant: "destructive",
        });
      } else {
        setFarms(farmsData || []);
      }
    } catch (error) {
      console.error("Error in fetchFarms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) return;

      const { data: newFarm, error } = await supabase
        .from("farms")
        .insert({
          farmer_id: profile.id,
          name: formData.name,
          location: formData.location,
          size_hectares: parseFloat(formData.size_hectares),
          soil_type: formData.soil_type,
          crops: formData.crops,
          coordinates: null // We'll add GPS coordinates later
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding farm:", error);
        toast({
          title: "Error adding farm",
          description: "Unable to add your farm. Please try again.",
          variant: "destructive",
        });
      } else {
        setFarms(prev => [newFarm, ...prev]);
        setShowAddFarm(false);
        setFormData({
          name: '',
          location: '',
          size_hectares: '',
          soil_type: '',
          crops: []
        });
        toast({
          title: "Farm added successfully!",
          description: "Your farm has been added to your portfolio.",
        });
      }
    } catch (error) {
      console.error("Error in handleAddFarm:", error);
    }
  };

  const handleCropToggle = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  const getTotalFarmSize = () => {
    return farms.reduce((total, farm) => total + farm.size_hectares, 0);
  };

  const getMostCommonCrop = () => {
    const cropCounts: { [key: string]: number } = {};
    farms.forEach(farm => {
      farm.crops.forEach(crop => {
        cropCounts[crop] = (cropCounts[crop] || 0) + 1;
      });
    });
    
    const mostCommon = Object.entries(cropCounts).sort(([,a], [,b]) => b - a)[0];
    return mostCommon ? mostCommon[0] : 'None';
  };

  if (loading) {
    return (
      <Card className={expanded ? "w-full" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>My Farms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading farm data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expanded && farms.length > 0) {
    return (
      <Card className="hover:shadow-medium transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-primary" />
              <span>My Farms</span>
            </div>
            <Dialog open={showAddFarm} onOpenChange={setShowAddFarm}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Farm</DialogTitle>
                  <DialogDescription>
                    Register a new farm to your portfolio for better management and tracking.
                  </DialogDescription>
                </DialogHeader>
                {/* Add Farm Form will go here */}
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription className="text-sm">
            Farm portfolio overview
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-muted-foreground">Total Farms</p>
                <p className="text-2xl font-bold text-primary">{farms.length}</p>
              </div>
              <div className="text-center p-3 bg-accent/5 rounded-lg">
                <p className="text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold text-accent">{getTotalFarmSize().toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hectares</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Farms:</p>
              {farms.slice(0, 2).map((farm) => (
                <div key={farm.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium text-sm">{farm.name}</p>
                    <p className="text-xs text-muted-foreground">{farm.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{farm.size_hectares} ha</p>
                    <p className="text-xs text-muted-foreground">{farm.crops.length} crops</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Primary Crop: {getMostCommonCrop()}</p>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(farms.flatMap(f => f.crops))).slice(0, 3).map(crop => (
                  <Badge key={crop} variant="outline" className="text-xs">
                    {crop}
                  </Badge>
                ))}
                {Array.from(new Set(farms.flatMap(f => f.crops))).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{Array.from(new Set(farms.flatMap(f => f.crops))).length - 3} more
                  </Badge>
                )}
              </div>
            </div>
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
            <Map className="h-5 w-5" />
            <span>Farm Management</span>
          </div>
          <Dialog open={showAddFarm} onOpenChange={setShowAddFarm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Farm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Farm</DialogTitle>
                <DialogDescription>
                  Register a new farm to your portfolio for better management and tracking.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Farm Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sunrise Farm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Ibadan, Oyo State"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size">Size (Hectares)</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.1"
                    value={formData.size_hectares}
                    onChange={(e) => setFormData(prev => ({ ...prev, size_hectares: e.target.value }))}
                    placeholder="e.g., 2.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="soil">Soil Type</Label>
                  <Select value={formData.soil_type} onValueChange={(value) => setFormData(prev => ({ ...prev, soil_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Crops (Select all that apply)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableCrops.map(crop => (
                      <Button
                        key={crop}
                        variant={formData.crops.includes(crop) ? "default" : "outline"}
                        size="sm"
                        type="button"
                        onClick={() => handleCropToggle(crop)}
                        className="text-xs"
                      >
                        {crop}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddFarm} 
                  className="w-full"
                  disabled={!formData.name || !formData.location || !formData.size_hectares}
                >
                  Add Farm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Manage your farm portfolio and track crop performance</CardDescription>
      </CardHeader>
      <CardContent>
        {farms.length === 0 ? (
          <div className="text-center py-12">
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No farms registered yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first farm to start tracking your agricultural activities and get personalized recommendations.
            </p>
            <Button onClick={() => setShowAddFarm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Your First Farm
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <Leaf className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{farms.length}</p>
                <p className="text-sm text-muted-foreground">Total Farms</p>
              </div>
              <div className="bg-accent/5 p-4 rounded-lg text-center">
                <Ruler className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-accent">{getTotalFarmSize().toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Hectares</p>
              </div>
              <div className="bg-trust/5 p-4 rounded-lg text-center">
                <MapPin className="h-6 w-6 text-trust mx-auto mb-2" />
                <p className="text-2xl font-bold text-trust">{Array.from(new Set(farms.flatMap(f => f.crops))).length}</p>
                <p className="text-sm text-muted-foreground">Crop Types</p>
              </div>
              <div className="bg-earth/5 p-4 rounded-lg text-center">
                <Map className="h-6 w-6 text-earth mx-auto mb-2" />
                <p className="text-sm font-bold text-earth">{getMostCommonCrop()}</p>
                <p className="text-sm text-muted-foreground">Primary Crop</p>
              </div>
            </div>

            {/* Farm List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Farms</h3>
              {farms.map((farm) => (
                <Card key={farm.id} className="hover:shadow-medium transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{farm.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{farm.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium">Size</p>
                            <p className="text-sm text-muted-foreground">{farm.size_hectares} hectares</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Soil Type</p>
                            <p className="text-sm text-muted-foreground">{farm.soil_type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Crops</p>
                            <p className="text-sm text-muted-foreground">{farm.crops.length} types</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Added</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(farm.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Crops:</p>
                          <div className="flex flex-wrap gap-1">
                            {farm.crops.map(crop => (
                              <Badge key={crop} variant="secondary" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};