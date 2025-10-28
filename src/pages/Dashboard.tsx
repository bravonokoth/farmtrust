import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WeatherWidget } from '@/components/WeatherWidget';
import { MarketPricesWidget } from '@/components/MarketPricesWidget';
import { AIFarmAssistant } from '@/components/AIFarmAssistant';
import { FarmMapWidget } from '@/components/FarmMapWidget';
import { MarketplaceWidget } from '@/components/MarketplaceWidget';
import { AgentDashboard } from '@/components/AgentDashboard';

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
  email?: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load profile directly from Supabase
  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate('/auth');
        return;
      }

      console.log('Session user ID:', session.user.id);

      // 1. Try to fetch profile
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // 2. If not found → create it
      if (error?.code === 'PGRST116' || !profileData) {
        const newProfileData = {
          user_id: session.user.id,
          full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          phone_number: session.user.user_metadata.phone_number || '',
          location: session.user.user_metadata.location || '',
          user_type: (session.user.user_metadata.user_type as 'farmer' | 'agent' | 'supplier' | 'admin') || 'farmer',
          is_verified: false,
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select()
          .single();

        if (insertError) throw insertError;
        profileData = createdProfile;

        toast({
          title: 'Profile Created',
          description: 'Welcome! Your profile has been set up.',
        });
      }

      if (error && error.code !== 'PGRST116') throw error;

      setProfile(profileData);
    } catch (error: any) {
      console.error('Profile load failed:', error);
      toast({
        title: 'Offline Mode',
        description: 'Dashboard loaded with limited features.',
        variant: 'destructive',
      });

      // Fallback: Show minimal UI
      const fallback: Profile = {
        id: 'offline',
        user_id: 'offline',
        full_name: 'Guest User',
        user_type: 'farmer',
        location: '',
        phone_number: '',
        is_verified: false,
      };
      setProfile(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Real-time profile updates
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!profile?.user_id || profile.user_id === 'offline') return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Sign Out Failed',
        description: error.message,
        variant: 'destructive',
      });
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
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
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
                  <CardDescription>Manage your agricultural products and inventory</CardDescription>
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
                    <Bar0Chart className="h-5 w-5" />
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
              <CardDescription>Your dashboard is being prepared...</CardDescription>
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
      case 'admin': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getRoleColor = (userType: string) => {
    switch (userType) {
      case 'farmer': return 'bg-primary text-primary-foreground';
      case 'agent': return 'bg-trust text-trust-foreground';
      case 'supplier': return 'bg-earth text-earth-foreground';
      case 'admin': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                Verified
              </Badge>
            )}
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};

export default Dashboard;