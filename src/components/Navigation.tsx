import { Button } from "@/components/ui/button";
import { Leaf, ShoppingCart, GraduationCap, Bot, Users, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();

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
            <Link to="/#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link to="/#ai-doctor" className="text-foreground hover:text-primary transition-colors">
              AI Doctor
            </Link>
            <Link to="/#learning" className="text-foreground hover:text-primary transition-colors">
              Learning Hub
            </Link>
            <Link to="/#community" className="text-foreground hover:text-primary transition-colors">
              Community
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!session ? (
              <>
                <Button asChild variant="outline">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                >
                  Sign Out
                </Button>
              </>
            )}
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
              <Link to="/#marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/#ai-doctor" className="text-foreground hover:text-primary transition-colors">
                AI Doctor
              </Link>
              <Link to="/#learning" className="text-foreground hover:text-primary transition-colors">
                Learning Hub
              </Link>
              <Link to="/#community" className="text-foreground hover:text-primary transition-colors">
                Community
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                {!session ? (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;