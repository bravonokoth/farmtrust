import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import heroFarming from "@/assets/hero-farming.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroFarming} 
          alt="African farmers working with modern technology" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          <Badge className="mb-6 bg-accent text-accent-foreground">
            🌍 First Agricultural Marketplace in Africa
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Revolutionizing
            <span className="block text-accent">African Agriculture</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Connect farmers, buyers, and agribusinesses across Africa. Trade produce, 
            access AI-powered farming insights, and build a sustainable future for agriculture.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-primary-foreground">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold">Secure Payments</p>
                <p className="text-sm text-primary-foreground/80">Fiat + Crypto Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-primary-foreground">
              <Zap className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold">AI-Powered</p>
                <p className="text-sm text-primary-foreground/80">Smart Recommendations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-primary-foreground">
              <Globe className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold">Borderless Trade</p>
                <p className="text-sm text-primary-foreground/80">Africa & Beyond</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};