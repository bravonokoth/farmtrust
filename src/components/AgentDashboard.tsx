import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Phone, 
  MessageSquare,
  Package,
  CheckCircle,
  Clock,
  BarChart3,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  user_type: 'farmer' | 'agent' | 'supplier' | 'admin';
  location: string;
  phone_number: string;
  is_verified: boolean;
}

interface AgentStats {
  totalFarmers: number;
  monthlyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  territorySize: string;
}

interface AgentDashboardProps {
  profile: Profile;
}

export const AgentDashboard = ({ profile }: AgentDashboardProps) => {
  const [stats, setStats] = useState<AgentStats>({
    totalFarmers: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    territorySize: "Not Set"
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgentStats();
  }, [profile.id]);

  const fetchAgentStats = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would fetch actual data from your database
      // For now, we'll simulate some data
      setTimeout(() => {
        setStats({
          totalFarmers: Math.floor(Math.random() * 50) + 10,
          monthlyRevenue: Math.floor(Math.random() * 2000) + 500,
          pendingOrders: Math.floor(Math.random() * 15) + 3,
          completedOrders: Math.floor(Math.random() * 45) + 20,
          territorySize: `${profile.location || 'Local Area'} - ${Math.floor(Math.random() * 10) + 5}km radius`
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      toast({
        title: "Error loading data",
        description: "Unable to fetch your agent statistics.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: "order_completed",
      message: "Order #FT001 delivered to John Doe",
      time: "2 hours ago",
      amount: "$125.50"
    },
    {
      id: 2,
      type: "farmer_registered",
      message: "New farmer Mary Johnson registered",
      time: "4 hours ago",
      amount: null
    },
    {
      id: 3,
      type: "order_pending",
      message: "Order #FT002 awaiting delivery confirmation",
      time: "1 day ago",
      amount: "$89.25"
    },
    {
      id: 4,
      type: "commission_earned",
      message: "Commission earned from multiple orders",
      time: "2 days ago",
      amount: "$45.75"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'farmer_registered': return <Users className="h-4 w-4 text-trust" />;
      case 'order_pending': return <Clock className="h-4 w-4 text-accent" />;
      case 'commission_earned': return <DollarSign className="h-4 w-4 text-earth" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Farmers Served</p>
                <p className="text-2xl font-bold text-primary">{stats.totalFarmers}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-earth">${stats.monthlyRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-earth opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-accent">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-accent opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold text-trust">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-trust opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="farmers">My Farmers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="territory">Territory</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Your latest agent activities and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          {activity.amount && <p className="text-sm font-semibold text-primary">{activity.amount}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Territory Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Territory Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Coverage Area</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stats.territorySize}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-trust/5 rounded-lg">
                    <p className="text-2xl font-bold text-trust">{stats.totalFarmers}</p>
                    <p className="text-sm text-muted-foreground">Active Farmers</p>
                  </div>
                  <div className="text-center p-3 bg-earth/5 rounded-lg">
                    <p className="text-2xl font-bold text-earth">98%</p>
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Farmers via SMS
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Broadcast Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farmers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>My Farmers</span>
              </CardTitle>
              <CardDescription>
                Farmers in your territory that you support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Farmer Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will show all farmers in your territory, their profiles, and order history.
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Farmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Order Management</span>
              </CardTitle>
              <CardDescription>
                Track and manage orders for your farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-accent/5 p-4 rounded-lg text-center">
                  <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent">{stats.pendingOrders}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {Math.floor(stats.completedOrders * 0.3)}
                  </p>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                </div>
                <div className="bg-trust/5 p-4 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 text-trust mx-auto mb-2" />
                  <p className="text-2xl font-bold text-trust">{stats.completedOrders}</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
              
              <p className="text-muted-foreground text-center">
                Detailed order management interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Territory Management</span>
              </CardTitle>
              <CardDescription>
                Manage your assigned territory and coverage area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Territory Map</h3>
                  <p className="text-muted-foreground mb-4">
                    View your coverage area, farmer locations, and delivery routes on an interactive map.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Current Territory</h4>
                    <p className="text-sm text-muted-foreground">{stats.territorySize}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Coverage Status</h4>
                    <Badge className="bg-primary/10 text-primary">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Earnings & Commissions</span>
              </CardTitle>
              <CardDescription>
                Track your earnings and commission payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-earth/5 p-6 rounded-lg text-center">
                  <DollarSign className="h-8 w-8 text-earth mx-auto mb-3" />
                  <p className="text-3xl font-bold text-earth">${stats.monthlyRevenue}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold text-primary">
                    ${Math.floor(stats.monthlyRevenue * 0.15)}
                  </p>
                  <p className="text-sm text-muted-foreground">Commission Rate (15%)</p>
                </div>
                <div className="bg-trust/5 p-6 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-trust mx-auto mb-3" />
                  <p className="text-3xl font-bold text-trust">
                    ${Math.floor(stats.monthlyRevenue * 3.2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-earth/10 to-primary/10 rounded-lg border border-earth/20">
                <h4 className="font-semibold text-earth mb-2">💰 Commission Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Product Sales:</p>
                    <p className="text-muted-foreground">15% commission on all sales</p>
                  </div>
                  <div>
                    <p className="font-medium">Farmer Registration:</p>
                    <p className="text-muted-foreground">$10 bonus per new farmer</p>
                  </div>
                  <div>
                    <p className="font-medium">Monthly Bonus:</p>
                    <p className="text-muted-foreground">$50 for 20+ successful deliveries</p>
                  </div>
                  <div>
                    <p className="font-medium">Payment:</p>
                    <p className="text-muted-foreground">Weekly bank transfers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};