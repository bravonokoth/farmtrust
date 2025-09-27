import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Package, Leaf, Search, Filter, Star, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  image_url?: string;
  is_organic: boolean;
  specifications: any;
  supplier_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    is_verified: boolean;
  };
}

interface MarketplaceWidgetProps {
  compact?: boolean;
}

export const MarketplaceWidget = ({ compact = false }: MarketplaceWidgetProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Products', icon: Package },
    { value: 'seeds', label: 'Seeds & Seedlings', icon: Leaf },
    { value: 'fertilizers', label: 'Fertilizers', icon: Package },
    { value: 'pesticides', label: 'Pesticides', icon: Package },
    { value: 'equipment', label: 'Equipment', icon: Package }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("agricultural_products")
        .select(`
          *,
          profiles:supplier_id (
            full_name,
            is_verified
          )
        `)
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq("category", selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (compact) {
        query = query.limit(6);
      } else {
        query = query.limit(20);
      }

      const { data: productsData, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        // Generate sample data for demonstration
        await generateSampleProducts();
      } else if (productsData && productsData.length > 0) {
        setProducts(productsData);
      } else {
        // Generate sample data if no products exist
        await generateSampleProducts();
      }
    } catch (error) {
      console.error("Error in fetchProducts:", error);
      toast({
        title: "Error loading products",
        description: "Unable to fetch marketplace products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleProducts = async () => {
    const sampleProducts = [
      {
        name: "Premium Maize Seeds",
        category: "seeds",
        description: "High-yield drought-resistant maize variety suitable for all seasons",
        price: 25.00,
        currency: "USD",
        stock_quantity: 500,
        is_organic: false,
        specifications: { variety: "Premium Hybrid", germination_rate: "95%", maturity: "90-120 days" }
      },
      {
        name: "Organic Compost Fertilizer",
        category: "fertilizers",
        description: "100% organic compost made from farm waste and natural materials",
        price: 15.50,
        currency: "USD",
        stock_quantity: 200,
        is_organic: true,
        specifications: { n_p_k: "3-2-2", organic_matter: "85%", ph: "6.5-7.0" }
      },
      {
        name: "Bio Pesticide Spray",
        category: "pesticides",
        description: "Natural pest control solution safe for crops and environment",
        price: 32.00,
        currency: "USD",
        stock_quantity: 150,
        is_organic: true,
        specifications: { active_ingredient: "Neem Extract", concentration: "2%", application_rate: "2ml/L" }
      },
      {
        name: "Rice Seeds - Premium Variety",
        category: "seeds",
        description: "High-quality rice seeds with excellent grain quality and yield",
        price: 18.75,
        currency: "USD",
        stock_quantity: 300,
        is_organic: false,
        specifications: { variety: "FARO 44", yield_potential: "6-8 tons/ha", maturity: "120-130 days" }
      },
      {
        name: "NPK Fertilizer 20:10:10",
        category: "fertilizers",
        description: "Balanced fertilizer perfect for vegetable and grain crops",
        price: 28.00,
        currency: "USD",
        stock_quantity: 180,
        is_organic: false,
        specifications: { n_p_k: "20-10-10", granule_size: "2-4mm", water_soluble: "95%" }
      },
      {
        name: "Hand Weeder Tool",
        category: "equipment",
        description: "Durable hand tool for efficient weed removal in small farms",
        price: 12.50,
        currency: "USD",
        stock_quantity: 75,
        is_organic: false,
        specifications: { material: "Steel", handle: "Wooden", weight: "0.8kg" }
      }
    ];

    const processedProducts = sampleProducts.map((product, index) => ({
      id: `sample-${index}`,
      ...product,
      supplier_id: `supplier-${index}`,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: `Verified Supplier ${index + 1}`,
        is_verified: true
      }
    }));

    let filteredProducts = processedProducts;
    
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setProducts(filteredProducts.slice(0, compact ? 6 : 20) as Product[]);
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
    
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart.",
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    const IconComponent = categoryData?.icon || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seeds': return 'bg-primary/10 text-primary border-primary/20';
      case 'fertilizers': return 'bg-earth/10 text-earth border-earth/20';
      case 'pesticides': return 'bg-trust/10 text-trust border-trust/20';
      case 'equipment': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Agricultural Marketplace</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Marketplace</span>
            </div>
            <Badge variant="secondary">
              {Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)} items in cart
            </Badge>
          </CardTitle>
          <CardDescription>Featured agricultural products from verified suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <Card key={product.id} className="hover:shadow-medium transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      {product.is_organic && (
                        <Badge className="bg-primary/10 text-primary text-xs">
                          Organic
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          ${product.price}
                          <span className="text-xs font-normal text-muted-foreground">/unit</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.stock_quantity} in stock
                        </p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <Badge className={getCategoryColor(product.category)}>
                        {getCategoryIcon(product.category)}
                        <span className="ml-1 capitalize">{product.category}</span>
                      </Badge>
                      
                      {product.profiles?.is_verified && (
                        <div className="flex items-center space-x-1 text-trust">
                          <Star className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Agricultural Marketplace</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)} items in cart
            </Badge>
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Buy quality agricultural inputs from verified suppliers with delivery to your location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center space-x-2">
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                  <div className="text-center">
                    {getCategoryIcon(product.category)}
                    <p className="text-sm text-muted-foreground mt-2 capitalize">{product.category}</p>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    {product.is_organic && (
                      <Badge className="bg-primary/10 text-primary text-xs ml-2">
                        Organic
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        ${product.price}
                        <span className="text-sm font-normal text-muted-foreground">/unit</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.stock_quantity} in stock
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge className={getCategoryColor(product.category)}>
                          {getCategoryIcon(product.category)}
                          <span className="ml-1 capitalize">{product.category}</span>
                        </Badge>
                      </div>
                      
                      {product.profiles?.is_verified && (
                        <div className="flex items-center space-x-1 text-trust">
                          <Star className="h-4 w-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Supplier: {product.profiles?.full_name || 'Unknown'}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => addToCart(product.id)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}

        {/* Cart Summary */}
        {Object.keys(cartItems).length > 0 && (
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary">
                  Cart Summary: {Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)} items
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ready to checkout? Items will be delivered by verified agents in your area.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  View Cart
                </Button>
                <Button>
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};