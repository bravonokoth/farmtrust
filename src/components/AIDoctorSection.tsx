import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Camera, FileText, Zap, Leaf, Heart } from "lucide-react";

export const AIDoctorSection = () => {
  return (
    <section id="ai-doctor" className="py-20 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary text-primary-foreground">
            🤖 AI Doctor
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            AI-Powered Agricultural Health
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant diagnosis and treatment recommendations for your crops and livestock. 
            Our AI analyzes images and symptoms to provide expert agricultural health guidance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Doctor Features */}
          <div className="space-y-8">
            <Card className="border-2 border-trust/20 hover:border-trust/40 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-trust/10 rounded-lg">
                    <Leaf className="h-6 w-6 text-trust" />
                  </div>
                  <CardTitle className="text-xl">Plant Health Diagnosis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upload photos of diseased crops and get instant diagnosis with treatment recommendations.
                </p>
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="text-sm">Photo Analysis</span>
                  <span className="text-muted-foreground">•</span>
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">Treatment Plan</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Livestock Health</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Describe symptoms or upload images of your animals for health assessment and care guidance.
                </p>
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI Analysis</span>
                  <span className="text-muted-foreground">•</span>
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">Instant Results</span>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full bg-gradient-to-r from-trust to-primary text-primary-foreground">
              Try AI Doctor Now
              <Bot className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* AI Doctor Interface Mockup */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-background to-secondary/20 border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-trust" />
                  <span>AI Agricultural Doctor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Diagnosis */}
                <div className="bg-trust/5 p-4 rounded-lg border border-trust/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-trust rounded-full"></div>
                    <span className="font-medium text-trust">Analysis Complete</span>
                  </div>
                  <p className="text-sm text-foreground mb-2">
                    <strong>Diagnosis:</strong> Early Blight (Alternaria solani)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: 94% • Fungal infection affecting tomato leaves
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Recommended Treatment:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Apply copper-based fungicide weekly</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Improve air circulation around plants</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Remove affected leaves immediately</span>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Get Detailed Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};