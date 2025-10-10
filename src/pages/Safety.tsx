import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CloudRain, Wind, Mountain, AlertTriangle, Shield, Phone } from "lucide-react";

const Safety = () => {
  const emergencyContacts = [
    { service: "Emergency Services", number: "999", icon: "🚨" },
    { service: "Fire & Rescue", number: "994", icon: "🚒" },
    { service: "Police", number: "999", icon: "👮" },
    { service: "Ambulance", number: "999", icon: "🚑" },
    { service: "Civil Defence", number: "991", icon: "🛡️" },
  ];

  const safetyGuides = [
    {
      icon: CloudRain,
      title: "Flood Safety",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      sections: [
        {
          title: "Before a Flood",
          tips: [
            "Know your area's flood risk and evacuation routes",
            "Prepare an emergency kit with food, water, and medicines for 3 days",
            "Keep important documents in waterproof containers",
            "Install check valves to prevent water backup",
            "Have a family emergency communication plan",
          ],
        },
        {
          title: "During a Flood",
          tips: [
            "Move immediately to higher ground or upper floors",
            "Never walk, swim, or drive through flood waters",
            "Turn off utilities at the main switches if safe to do so",
            "Stay informed via radio or official channels",
            "Go to designated flood shelters (check our Map)",
          ],
        },
        {
          title: "After a Flood",
          tips: [
            "Return home only when authorities say it's safe",
            "Check for structural damage before entering",
            "Avoid flood water - it may be contaminated",
            "Document damage with photos for insurance",
            "Clean and disinfect everything that got wet",
          ],
        },
      ],
    },
    {
      icon: Wind,
      title: "Haze Safety",
      color: "text-gray-500",
      bg: "bg-gray-500/10",
      sections: [
        {
          title: "Understanding Haze",
          tips: [
            "Check Air Pollution Index (API) daily",
            "API 0-50: Good | 51-100: Moderate | 101-200: Unhealthy",
            "API 201-300: Very Unhealthy | 300+: Hazardous",
            "Stay informed via DoE Malaysia website",
          ],
        },
        {
          title: "During Haze",
          tips: [
            "Stay indoors with windows and doors closed",
            "Use air purifiers or wet cloths on vents",
            "Wear N95 masks when outdoors (not surgical masks)",
            "Drink plenty of water to stay hydrated",
            "Avoid outdoor activities, especially exercise",
            "Keep medication readily available if you have asthma",
          ],
        },
        {
          title: "Protect Vulnerable Groups",
          tips: [
            "Extra care for children, elderly, and those with respiratory conditions",
            "Monitor symptoms: coughing, throat irritation, difficulty breathing",
            "Seek medical attention if symptoms worsen",
            "Keep schools informed about health conditions",
          ],
        },
      ],
    },
    {
      icon: Mountain,
      title: "Landslide Precautions",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      sections: [
        {
          title: "Warning Signs",
          tips: [
            "Cracks in walls, roads, or ground",
            "Sudden changes in water level in streams",
            "Doors or windows sticking suddenly",
            "Bulging ground at base of slopes",
            "Tilting trees, poles, or fences",
            "Unusual sounds: trees cracking, boulders knocking",
          ],
        },
        {
          title: "Before Heavy Rain",
          tips: [
            "Stay alert during prolonged heavy rainfall",
            "Know evacuation routes from your area",
            "Have emergency supplies ready",
            "Clear drainage systems around your property",
            "Monitor local weather and authority alerts",
          ],
        },
        {
          title: "If Landslide Occurs",
          tips: [
            "Move away from the path immediately",
            "Run to the nearest high ground perpendicular to the slide",
            "Alert neighbors and authorities",
            "Stay away from the slide area - more may follow",
            "Report downed utility lines immediately",
          ],
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words px-2">
          Disaster Safety Guide
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto break-words px-4 leading-relaxed">
          Essential preparation and response guidelines for environmental disasters in Malaysia
        </p>
      </div>

      {/* Emergency Contacts */}
      <Card className="p-6 mb-12 shadow-custom-xl gradient-warm text-white">
        <div className="flex items-center space-x-3 mb-6">
          <Phone className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Emergency Contacts</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div className="text-2xl sm:text-3xl mb-2">{contact.icon}</div>
              <div className="font-semibold mb-1 text-xs sm:text-sm break-words leading-tight">{contact.service}</div>
              <a
                href={`tel:${contact.number}`}
                className="text-lg sm:text-2xl font-bold hover:underline"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety Guides */}
      <div className="space-y-6">
        {safetyGuides.map((guide, index) => (
          <Card key={index} className="p-6 shadow-custom-lg">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg ${guide.bg} flex items-center justify-center flex-shrink-0`}>
                <guide.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${guide.color}`} />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{guide.title}</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {guide.sections.map((section, sectionIndex) => (
                <AccordionItem key={sectionIndex} value={`item-${sectionIndex}`}>
                  <AccordionTrigger className="text-base sm:text-lg font-semibold">
                    <span className="break-words pr-4">{section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm sm:text-base break-words leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card className="p-8 mt-12 text-center shadow-custom-lg">
        <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">Find Nearby Shelters</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Use our interactive map to locate flood shelters, hospitals, and emergency services near you
        </p>
        <a href="/map">
          <button className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold shadow-custom-md hover:shadow-custom-lg transition-shadow">
            View Emergency Map
          </button>
        </a>
      </Card>

      {/* Preparation Checklist */}
      <Card className="p-6 mt-6 bg-muted/30 shadow-custom-md">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 break-words">🎒 Emergency Kit Checklist</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="space-y-2">
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Water (1 gallon/person/day for 3 days)</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Non-perishable food (3-day supply)</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">First aid kit</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Flashlight and extra batteries</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Battery-powered or hand-crank radio</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Prescription medications</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Important documents (waterproof container)</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Cash and credit cards</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">Phone charger and power bank</span>
            </li>
            <li className="flex items-start sm:items-center space-x-2 min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words leading-relaxed">N95 masks</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Safety;
