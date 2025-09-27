import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIFarmAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Farm Assistant. I can help you with crop selection, planting schedules, pest management, irrigation advice, and market insights. What would you like to know about farming today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Simulate AI response for now
      setTimeout(() => {
        const aiResponse = generateAIResponse(inputMessage);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pest') || input.includes('insect') || input.includes('disease')) {
      return `For pest management, I recommend:\n\n1. **Integrated Pest Management (IPM)**: Use a combination of biological, cultural, and chemical controls\n2. **Regular monitoring**: Check your crops weekly for early signs of pest damage\n3. **Natural predators**: Encourage beneficial insects like ladybugs and parasitic wasps\n4. **Organic solutions**: Try neem oil, diatomaceous earth, or companion planting\n5. **Proper sanitation**: Remove infected plant debris and maintain clean growing areas\n\nWhat specific pest or disease are you dealing with?`;
    }
    
    if (input.includes('plant') || input.includes('seed') || input.includes('crop')) {
      return `For successful planting, consider these factors:\n\n🌱 **Soil Preparation**: Test soil pH and add organic matter\n📅 **Timing**: Plant according to your local climate and growing season\n💧 **Water Management**: Ensure proper drainage and consistent moisture\n🌡️ **Temperature**: Check minimum and maximum temperature requirements\n📏 **Spacing**: Follow recommended plant spacing for optimal growth\n\nWhich crops are you planning to grow? I can provide specific planting guidance.`;
    }
    
    if (input.includes('water') || input.includes('irrigation') || input.includes('drought')) {
      return `Water management is crucial for healthy crops:\n\n💧 **Irrigation Schedule**: Water deeply but less frequently to encourage deep roots\n⏰ **Best Time**: Water early morning (6-8 AM) to reduce evaporation\n🌡️ **Soil Moisture**: Check soil moisture 2-3 inches deep before watering\n🚿 **Drip Irrigation**: Most efficient method, delivers water directly to roots\n☔ **Rainwater**: Collect rainwater for sustainable irrigation\n\nBased on current weather conditions, adjust your watering schedule accordingly.`;
    }
    
    if (input.includes('fertilizer') || input.includes('nutrition') || input.includes('nutrient')) {
      return `Proper nutrition is key to healthy crops:\n\n🧪 **Soil Testing**: Test soil to determine nutrient needs\n🌿 **Organic Options**: Compost, manure, and organic fertilizers improve soil health\n⚖️ **NPK Balance**: Understand Nitrogen (growth), Phosphorus (roots), Potassium (disease resistance)\n📋 **Application Timing**: Apply fertilizers at the right growth stages\n💚 **Micronutrients**: Don't forget iron, zinc, manganese for complete nutrition\n\nWhat type of crops are you fertilizing? I can suggest specific nutrient programs.`;
    }
    
    if (input.includes('market') || input.includes('price') || input.includes('sell')) {
      return `Market strategy is important for profitability:\n\n📊 **Price Monitoring**: Check current market prices regularly\n🎯 **Market Timing**: Harvest and sell when prices are favorable\n📦 **Post-Harvest**: Proper handling and storage to maintain quality\n🤝 **Direct Sales**: Consider farmers markets and direct-to-consumer sales\n📋 **Contracts**: Explore contract farming for guaranteed prices\n\nCheck the Market Prices section for current rates in your area!`;
    }
    
    if (input.includes('weather') || input.includes('rain') || input.includes('season')) {
      return `Weather planning is essential for farming success:\n\n🌤️ **Daily Monitoring**: Check weather forecasts regularly\n☔ **Rainy Season**: Prepare drainage and plant water-loving crops\n☀️ **Dry Season**: Focus on drought-resistant varieties and water conservation\n🌡️ **Temperature**: Monitor for frost warnings and heat stress\n📅 **Seasonal Planning**: Plan crops according to wet and dry seasons\n\nCheck the Weather section for detailed forecasts and farming recommendations!`;
    }
    
    // Default response
    return `That's a great question about farming! Here are some general tips that might help:\n\n🌾 **Crop Selection**: Choose varieties suited to your climate and soil\n💧 **Water Management**: Maintain consistent moisture without overwatering\n🌱 **Soil Health**: Keep soil rich with organic matter and proper pH\n🦟 **Pest Control**: Monitor regularly and use integrated pest management\n📊 **Record Keeping**: Track what works best for your farm\n\nCould you be more specific about what aspect of farming you'd like help with? I can provide more targeted advice for topics like:\n- Crop diseases and pests\n- Planting schedules\n- Soil management\n- Irrigation systems\n- Market planning`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>AI Farm Assistant</span>
          <Badge variant="secondary" className="ml-2">
            Available 24/7
          </Badge>
        </CardTitle>
        <CardDescription>
          Get instant expert advice on crops, pests, irrigation, and farming best practices
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-4 w-4 mt-0.5 text-primary" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask me anything about farming... (e.g., 'How do I deal with tomato pests?', 'When should I plant maize?')"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || loading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("What crops should I plant this season?")}
              disabled={loading}
            >
              Crop Selection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("How do I manage pests naturally?")}
              disabled={loading}
            >
              Pest Control
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("What's the best irrigation schedule?")}
              disabled={loading}
            >
              Irrigation
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("When is the best time to sell my crops?")}
              disabled={loading}
            >
              Market Timing
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};