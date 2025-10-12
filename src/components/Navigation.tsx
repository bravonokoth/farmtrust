import { Button } from "@/components/ui/button";
import { Leaf, ShoppingCart, GraduationCap, Bot, Users, Menu } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FarmTrust</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </a>
            <a href="#ai-doctor" className="text-foreground hover:text-primary transition-colors">
              AI Doctor
            </a>
            <a href="#learning" className="text-foreground hover:text-primary transition-colors">
              Learning Hub
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors">
              Community
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline">Sign In</Button>
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </a>
              <a href="#ai-doctor" className="text-foreground hover:text-primary transition-colors">
                AI Doctor
              </a>
              <a href="#learning" className="text-foreground hover:text-primary transition-colors">
                Learning Hub
              </a>
              <a href="#community" className="text-foreground hover:text-primary transition-colors">
                Community
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="w-full">Sign In</Button>
                <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};