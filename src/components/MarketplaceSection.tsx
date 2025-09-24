import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Truck, ShoppingCart } from "lucide-react";

export const MarketplaceSection = () => {
  const products = [
    {
      id: 1,
      name: "Premium Organic Rice",
      farmer: "Kwame Asante",
      location: "Ghana",
      price: "$2.50/kg",
      rating: 4.8,
      image: "🌾",
      category: "Grains",
      verified: true
    },
    {
      id: 2,
      name: "Fresh Tomatoes",
      farmer: "Amara Okafor",
      location: "Nigeria", 
      price: "$1.20/kg",
      rating: 4.9,
      image: "🍅",
      category: "Vegetables",
      verified: true
    },
    {
      id: 3,
      name: "Coffee Beans - Arabica",
      farmer: "Zara Mwangi",
      location: "Kenya",
      price: "$8.50/kg",
      rating: 4.7,
      image: "☕",
      category: "Cash Crops",
      verified: true
    }
  ];

  return (
    <section id="marketplace" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-trust text-trust-foreground">
            🛒 Marketplace
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trade Directly with Farmers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse fresh produce, grains, and agricultural products from verified farmers across Africa. 
            Fair prices, transparent ratings, and secure transactions.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All Products", "Grains", "Vegetables", "Fruits", "Cash Crops", "Livestock", "Equipment"].map((category) => (
            <Button key={category} variant="outline" className="rounded-full">
              {category}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="text-6xl mb-4">{product.image}</div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-primary">{product.farmer}</span>
                      {product.verified && (
                        <Badge className="bg-trust text-trust-foreground text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {product.location}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-2xl font-bold text-primary">{product.price}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" className="bg-accent text-accent-foreground">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-to-r from-primary to-trust text-primary-foreground">
            View All Products
            <ShoppingCart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};