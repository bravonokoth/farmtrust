import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  Cloud, 
  TrendingUp, 
  MessageSquare, 
  Map, 
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeatherWidget } from "@/components/WeatherWidget";
import { MarketPricesWidget } from "@/components/MarketPricesWidget";
import { AIFarmAssistant } from "@/components/AIFarmAssistant";
import { FarmMapWidget } from "@/components/FarmMapWidget";
import { MarketplaceWidget } from "@/components/MarketplaceWidget";
import { AgentDashboard } from "@/components/AgentDashboard";

interface Profile {
  id: string;
  full_name: string;
  user_type: 'farmer' | 'agent' | 'supplier' | 'admin';
  location: string;
  phone_number: string;
  is_verified: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } else {
        setProfile(profileData as Profile);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              There was an issue loading your profile. Please try signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (profile.user_type) {
      case 'farmer':
        return (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="farms">My Farms</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WeatherWidget />
                <MarketPricesWidget />
                <FarmMapWidget />
              </div>
              <MarketplaceWidget />
            </TabsContent>

            <TabsContent value="weather">
              <WeatherWidget expanded />
            </TabsContent>

            <TabsContent value="market">
              <MarketPricesWidget expanded />
            </TabsContent>

            <TabsContent value="farms">
              <FarmMapWidget expanded />
            </TabsContent>

            <TabsContent value="ai">
              <AIFarmAssistant />
            </TabsContent>
          </Tabs>
        );

      case 'agent':
        return <AgentDashboard profile={profile} />;

      case 'supplier':
        return (
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="marketplace">Browse</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>My Products</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your agricultural products and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Product management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Order Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Order management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Sales Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketplace">
              <MarketplaceWidget />
            </TabsContent>
          </Tabs>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to FarmTrust</CardTitle>
              <CardDescription>
                Your dashboard is being prepared...
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  const getRoleIcon = (userType: string) => {
    switch (userType) {
      case 'farmer': return <Calendar className="h-4 w-4" />;
      case 'agent': return <Users className="h-4 w-4" />;
      case 'supplier': return <Package className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getRoleColor = (userType: string) => {
    switch (userType) {
      case 'farmer': return 'bg-primary text-primary-foreground';
      case 'agent': return 'bg-trust text-trust-foreground';
      case 'supplier': return 'bg-earth text-earth-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {profile.full_name}
            </h1>
            <Badge className={`flex items-center space-x-1 ${getRoleColor(profile.user_type)}`}>
              {getRoleIcon(profile.user_type)}
              <span className="capitalize">{profile.user_type}</span>
            </Badge>
            {profile.is_verified && (
              <Badge variant="outline" className="text-trust border-trust">
                ✓ Verified
              </Badge>
            )}
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};

export default Dashboard;