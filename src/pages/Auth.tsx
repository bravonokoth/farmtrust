import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Leaf, User, Users, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateInput } from '@/lib/security';
import type { Session } from '@supabase/supabase-js';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [userType, setUserType] = useState<'farmer' | 'agent' | 'supplier' | 'admin'>('farmer');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailValidation = validateInput(email, 'email');
      const passwordValidation = validateInput(password, 'password');
      const nameValidation = validateInput(fullName, 'name');

      if (!emailValidation.isValid) {
        toast({ title: 'Invalid email', description: emailValidation.error, variant: 'destructive' });
        return;
      }
      if (!passwordValidation.isValid) {
        toast({ title: 'Invalid password', description: passwordValidation.error, variant: 'destructive' });
        return;
      }
      if (!nameValidation.isValid) {
        toast({ title: 'Invalid name', description: nameValidation.error, variant: 'destructive' });
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone_number: phoneNumber, location, user_type: userType },
          emailRedirectTo: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/dashboard`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Backend sync
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          location,
          user_type: userType,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailValidation = validateInput(email, 'email');
      if (!emailValidation.isValid) {
        toast({ title: 'Invalid email', description: emailValidation.error, variant: 'destructive' });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'farmer':
        return <User className="h-4 w-4" />;
      case 'agent':
        return <Users className="h-4 w-4" />;
      case 'supplier':
        return <Building className="h-4 w-4" />;
      case 'admin':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getUserTypeDescription = (type: string) => {
    switch (type) {
      case 'farmer':
        return 'Access weather, market prices, AI assistance, and buy agricultural inputs';
      case 'agent':
        return 'Help farmers in your community and earn commission on sales';
      case 'supplier':
        return 'Sell agricultural inputs and equipment to farmers';
      case 'admin':
        return 'Manage platform operations';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FarmTrust</span>
          </div>
          <CardTitle className="text-2xl">Join FarmTrust</CardTitle>
          <CardDescription>Empowering African farmers with technology</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">I am a...</Label>
                  <Select
                    value={userType}
                    onValueChange={(value: 'farmer' | 'agent' | 'supplier' | 'admin') => setUserType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">
                        <div className="flex items-center space-x-2">
                          {getUserTypeIcon('farmer')}
                          <span>Farmer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="agent">
                        <div className="flex items-center space-x-2">
                          {getUserTypeIcon('agent')}
                          <span>Village Agent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="supplier">
                        <div className="flex items-center space-x-2">
                          {getUserTypeIcon('supplier')}
                          <span>Supplier</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          {getUserTypeIcon('admin')}
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{getUserTypeDescription(userType)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;