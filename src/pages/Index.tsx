import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { AIDoctorSection } from "@/components/AIDoctorSection";
import { LearningHubSection } from "@/components/LearningHubSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Globe, Users, MessageSquare, Mail, Phone, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <MarketplaceSection />
      <AIDoctorSection />
      <LearningHubSection />
      
      {/* Community Section */}
      <section id="community" className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              👥 Community
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the Agricultural Revolution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with farmers, experts, and agribusinesses. Share knowledge, 
              get support, and grow together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Farmer Network</h3>
              <p className="text-muted-foreground">
                Connect with 10,000+ verified farmers across Africa. Share experiences and learn together.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-trust" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Support</h3>
              <p className="text-muted-foreground">
                Get advice from agricultural experts, researchers, and experienced farmers in real-time.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Reach</h3>
              <p className="text-muted-foreground">
                Expand your market reach beyond borders. Trade with partners across continents.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Leaf className="h-8 w-8 text-accent" />
                <span className="text-2xl font-bold">myFarmTrust</span>
              </div>
              <p className="text-primary-foreground/80 mb-6">
                Revolutionizing African agriculture through technology, trust, and community.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@myfarmtrust.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 (0) 800 FARM TRUST</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria • Nairobi, Kenya • Accra, Ghana</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div>Marketplace</div>
                <div>AI Doctor</div>
                <div>Learning Hub</div>
                <div>Community</div>
                <div>Logistics</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div>Farmers</div>
                <div>Buyers</div>
                <div>Agribusinesses</div>
                <div>Educators</div>
                <div>Partners</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div>About Us</div>
                <div>Careers</div>
                <div>Press</div>
                <div>Contact</div>
                <div>Blog</div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
            <p className="text-primary-foreground/60">
              © 2024 myFarmTrust. All rights reserved. Building the future of African agriculture.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
