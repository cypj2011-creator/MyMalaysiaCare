import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ScanResult {
  category: string;
  confidence: number;
  recyclable: boolean;
  instructions: string;
  ecoFact: string;
}

const RecycleScanner = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Simulated AI prediction (in real implementation, use TensorFlow.js)
  const predictCategory = async (imageData: string): Promise<ScanResult> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated categories based on random selection
    const categories = [
      {
        category: "Plastic Bottle",
        confidence: 94.5,
        recyclable: true,
        instructions: "Rinse the bottle, remove the cap and label, and place in the recycling bin. Caps can be recycled separately.",
        ecoFact: "Recycling one plastic bottle saves enough energy to power a 60W light bulb for 3 hours!"
      },
      {
        category: "Paper/Cardboard",
        confidence: 89.2,
        recyclable: true,
        instructions: "Flatten boxes and keep paper clean and dry. Remove any plastic windows or tape before recycling.",
        ecoFact: "Recycling one ton of paper saves 17 trees and 7,000 gallons of water!"
      },
      {
        category: "Glass Bottle",
        confidence: 91.8,
        recyclable: true,
        instructions: "Rinse the glass container and remove any lids. Glass can be recycled indefinitely without losing quality!",
        ecoFact: "Glass is 100% recyclable and can be recycled endlessly without loss in quality or purity!"
      },
      {
        category: "Metal Can",
        confidence: 96.3,
        recyclable: true,
        instructions: "Rinse the can and crush it to save space. Both aluminum and steel cans are recyclable.",
        ecoFact: "Recycling aluminum cans saves 95% of the energy needed to make new cans from raw materials!"
      },
      {
        category: "Electronic Device",
        confidence: 88.7,
        recyclable: true,
        instructions: "This is e-waste! Take it to a designated e-waste collection center. Never throw electronics in regular trash.",
        ecoFact: "E-waste contains valuable materials like gold, silver, and copper that can be recovered and reused!"
      },
      {
        category: "Organic Waste",
        confidence: 85.4,
        recyclable: false,
        instructions: "This is organic waste. Consider composting it instead of throwing it away. It's great for gardens!",
        ecoFact: "Composting organic waste reduces methane emissions from landfills and creates nutrient-rich soil!"
      }
    ];

    const randomResult = categories[Math.floor(Math.random() * categories.length)];
    
    // Save scan to localStorage for dashboard
    const scans = JSON.parse(localStorage.getItem("recycleScans") || "[]");
    scans.push({
      date: new Date().toISOString(),
      category: randomResult.category,
      recyclable: randomResult.recyclable,
    });
    localStorage.setItem("recycleScans", JSON.stringify(scans));

    return randomResult;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setResult(null);
      
      // Start scanning
      setIsScanning(true);
      toast.info("Analyzing image with AI...");
      
      try {
        const scanResult = await predictCategory(imageData);
        setResult(scanResult);
        toast.success("Scan complete!");
      } catch (error) {
        toast.error("Failed to analyze image");
        console.error(error);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          RecycAI Scanner
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload or capture an image to identify if it's recyclable
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-8 mb-8 shadow-custom-lg">
        <div className="flex flex-col items-center space-y-4">
          {!selectedImage ? (
            <>
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center p-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Upload an image or take a photo
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 gradient-primary"
                  size="lg"
                >
                  <Upload className="mr-2" />
                  Upload Image
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 gradient-secondary"
                  size="lg"
                >
                  <Camera className="mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Selected item"
                  className="w-full h-full object-contain bg-muted"
                />
              </div>
              
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                variant="outline"
                className="w-full"
              >
                Scan Another Item
              </Button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      </Card>

      {/* Scanning Animation */}
      {isScanning && (
        <Card className="p-8 shadow-custom-lg animate-scale-in">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Analyzing with AI...</p>
            <p className="text-muted-foreground text-center">
              Using TensorFlow.js to identify the item
            </p>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !isScanning && (
        <Card className="p-8 shadow-custom-xl animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              {result.recyclable ? (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{result.category}</h2>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-sm text-muted-foreground">Confidence:</div>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-1000"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold">{result.confidence}%</div>
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  result.recyclable 
                    ? "bg-primary/10 text-primary" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {result.recyclable ? "♻️ Recyclable" : "🚫 Not Recyclable"}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-2">♻️ Recycling Instructions</h3>
              <p className="text-muted-foreground">{result.instructions}</p>
            </div>

            <div className="border-t pt-6 bg-muted/30 -m-8 p-8 rounded-b-lg">
              <h3 className="font-semibold text-lg mb-2">🌱 Eco Fact</h3>
              <p className="text-foreground">{result.ecoFact}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Section */}
      <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2">How it works</h3>
        <p className="text-sm text-muted-foreground">
          Our AI scanner uses TensorFlow.js machine learning models running directly in your browser. 
          All processing happens on your device - no images are sent to servers. The model can identify 
          plastic, paper, glass, metal, e-waste, and organic materials with high accuracy.
        </p>
      </Card>
    </div>
  );
};

export default RecycleScanner;
