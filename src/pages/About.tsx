import { Card } from "@/components/ui/card";
import { Leaf, Lightbulb, Users, Target, Award, Code } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Lightbulb,
      title: "AI-Powered",
      description: "Advanced machine learning with TensorFlow.js for accurate item identification"
    },
    {
      icon: Target,
      title: "User-Friendly",
      description: "Simple, intuitive interface designed for all Malaysians"
    },
    {
      icon: Code,
      title: "100% Client-Side",
      description: "All processing happens in your browser - fast, private, and works offline"
    },
  ];

  const techStack = [
    { name: "TensorFlow.js", purpose: "AI-powered recycling scanner" },
    { name: "Leaflet.js", purpose: "Interactive maps with Malaysian locations" },
    { name: "Chart.js", purpose: "Beautiful data visualization" },
    { name: "React", purpose: "Modern, responsive user interface" },
    { name: "TypeScript", purpose: "Type-safe, reliable code" },
    { name: "Tailwind CSS", purpose: "Beautiful, consistent design" },
  ];

  const goals = [
    {
      icon: "♻️",
      title: "Increase Recycling Rate",
      description: "Help Malaysia reach 40% recycling rate by 2025"
    },
    {
      icon: "🌱",
      title: "Environmental Education",
      description: "Make environmental protection accessible to everyone"
    },
    {
      icon: "🛡️",
      title: "Disaster Preparedness",
      description: "Keep Malaysians safe during environmental emergencies"
    },
    {
      icon: "📱",
      title: "Technology for Good",
      description: "Leverage AI and modern web tech for positive impact"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          About MyMalaysia Care+
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Empowering Malaysians to protect the environment with smart technology
        </p>
      </div>

      {/* Hero Mission */}
      <Card className="p-8 md:p-12 mb-12 shadow-custom-xl gradient-hero text-white text-center">
        <Leaf className="w-16 h-16 mx-auto mb-6 animate-float" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
          To make environmental protection easy, accessible, and effective for every Malaysian 
          through innovative technology and comprehensive education. We believe that when equipped 
          with the right tools and knowledge, everyone can make a significant positive impact on 
          our environment.
        </p>
      </Card>

      {/* The Problem */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">The Challenge</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-custom-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Low Recycling Rate</h3>
            <p className="text-muted-foreground">
              Malaysia's recycling rate is only 28%, far below the government's 40% target. 
              Many Malaysians don't know what can be recycled or how to recycle properly.
            </p>
          </Card>
          <Card className="p-6 shadow-custom-lg">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-semibold mb-2">Rising Waste</h3>
            <p className="text-muted-foreground">
              Over 38,000 tons of waste are generated daily in Malaysia. Without proper 
              recycling, our landfills are filling up rapidly.
            </p>
          </Card>
          <Card className="p-6 shadow-custom-lg">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Environmental Disasters</h3>
            <p className="text-muted-foreground">
              Floods, haze, and landslides affect Malaysians yearly, but many lack proper 
              disaster preparedness knowledge and resources.
            </p>
          </Card>
        </div>
      </div>

      {/* Our Solution */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Solution</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Goals</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal, index) => (
            <Card key={index} className="p-6 shadow-custom-lg">
              <div className="flex items-start space-x-4">
                <div className="text-4xl flex-shrink-0">{goal.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
                  <p className="text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <Card className="p-8 mb-12 shadow-custom-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Code className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">Technology Stack</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Built with modern, cutting-edge web technologies for the best user experience
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech, index) => (
            <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors">
              <div className="font-semibold text-primary mb-1">{tech.name}</div>
              <div className="text-sm text-muted-foreground">{tech.purpose}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Competition */}
      <Card className="p-8 shadow-custom-xl gradient-warm text-white text-center">
        <Award className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Malaysia Coolest Project 2025</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-4">
          Created by passionate students who believe technology can solve environmental 
          challenges. This project demonstrates how modern web technologies can create 
          real-world impact.
        </p>
        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
          <Users className="w-5 h-5" />
          <span className="font-semibold">Made with ❤️ for Malaysia</span>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Every scan, every recycled item, every small action contributes to a cleaner, 
          greener Malaysia. Start your journey today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/recycle">
            <button className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold shadow-custom-lg hover:shadow-custom-xl transition-shadow">
              Start Scanning
            </button>
          </a>
          <a href="/learn">
            <button className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              Learn More
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
