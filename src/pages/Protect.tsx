import { Card } from "@/components/ui/card";
import { Droplets, Lightbulb, TreePine, ShoppingBag, Home, Recycle, Car, Utensils } from "lucide-react";

const Protect = () => {
  const tips = [
    {
      icon: Droplets,
      title: "Save Water",
      tips: [
        "Fix leaking taps immediately - one drip per second wastes 5 gallons per day",
        "Take shorter showers (5-7 minutes maximum)",
        "Use a bucket to collect water while waiting for shower to warm up",
        "Install water-efficient fixtures and aerators",
        "Collect rainwater for plants and garden",
      ],
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Lightbulb,
      title: "Reduce Electricity",
      tips: [
        "Switch to LED bulbs - they use 75% less energy",
        "Unplug devices when not in use (phantom power drain)",
        "Use natural light whenever possible",
        "Set air conditioning to 24-25°C for optimal efficiency",
        "Use fans instead of AC when possible",
      ],
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      icon: TreePine,
      title: "Plant Trees",
      tips: [
        "Plant native Malaysian trees - they thrive better in local climate",
        "Join community tree-planting initiatives",
        "Create a small garden or maintain potted plants",
        "Support reforestation projects in Malaysia",
        "One tree absorbs 20kg of CO₂ per year",
      ],
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: ShoppingBag,
      title: "Reduce Plastic",
      tips: [
        "Bring reusable bags when shopping",
        "Use reusable water bottles and coffee cups",
        "Say no to plastic straws - use metal or bamboo alternatives",
        "Choose products with minimal or recyclable packaging",
        "Support businesses that use eco-friendly packaging",
      ],
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Recycle,
      title: "Practice Recycling",
      tips: [
        "Separate waste: plastic, paper, glass, metal",
        "Rinse containers before recycling",
        "Learn what can and cannot be recycled in Malaysia",
        "Use our RecycAI Scanner to identify recyclable items",
        "Support products made from recycled materials",
      ],
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Car,
      title: "Sustainable Transport",
      tips: [
        "Use public transportation when possible",
        "Carpool with friends or colleagues",
        "Walk or cycle for short distances",
        "Maintain your vehicle for better fuel efficiency",
        "Consider electric or hybrid vehicles",
      ],
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      icon: Utensils,
      title: "Reduce Food Waste",
      tips: [
        "Plan meals and buy only what you need",
        "Store food properly to extend freshness",
        "Compost organic waste for your garden",
        "Donate excess food to those in need",
        "Learn to cook with leftovers creatively",
      ],
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: Home,
      title: "Eco-Friendly Home",
      tips: [
        "Use natural cleaning products instead of chemicals",
        "Install solar panels if possible",
        "Improve home insulation to reduce energy use",
        "Choose energy-efficient appliances",
        "Create a composting system for organic waste",
      ],
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Protect the Environment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Simple daily actions that make a big difference for Malaysia's environment
        </p>
      </div>

      {/* Impact Banner */}
      <Card className="p-8 mb-12 gradient-hero text-white shadow-custom-xl">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Every Action Counts! 🌱
          </h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            If every Malaysian household adopted just 3 of these practices, we could save 
            enough energy to power 500,000 homes and reduce CO₂ emissions by 2 million tons per year!
          </p>
        </div>
      </Card>

      {/* Tips Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {tips.map((category, index) => (
          <Card
            key={index}
            className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg ${category.bg} flex items-center justify-center flex-shrink-0`}>
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold mb-3 break-words">{category.title}</h3>
                <ul className="space-y-2">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-2">
                      <span className="text-primary mt-1 flex-shrink-0">•</span>
                      <span className="text-muted-foreground text-sm break-words">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="p-8 mt-12 text-center shadow-custom-lg">
        <h2 className="text-2xl font-bold mb-4">Start Your Journey Today</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Choose 3 actions from above and commit to them for 30 days. Track your progress 
          on our Dashboard and see the positive impact you're making!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/recycle">
            <button className="px-6 py-3 rounded-lg gradient-primary text-white font-semibold shadow-custom-md hover:shadow-custom-lg transition-shadow">
              Scan Items Now
            </button>
          </a>
          <a href="/dashboard">
            <button className="px-6 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              View Dashboard
            </button>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Protect;
