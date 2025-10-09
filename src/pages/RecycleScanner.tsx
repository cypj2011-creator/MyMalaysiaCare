import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

interface ScanResult {
  category: string;
  confidence: number;
  recyclable: boolean;
  instructions: string;
  ecoFact: string;
  aiPrediction: string;
}

const RecycleScanner = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load TensorFlow.js MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        toast.info("Loading AI model...");
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsLoadingModel(false);
        toast.success("AI model ready!");
      } catch (error) {
        console.error("Failed to load model:", error);
        toast.error("Failed to load AI model");
        setIsLoadingModel(false);
      }
    };
    loadModel();
  }, []);

  // Map AI predictions to recycling categories
  const categorizeItem = (prediction: string): ScanResult => {
    const lowerPred = prediction.toLowerCase();
    
    // Plastic items
    if (lowerPred.includes("bottle") || lowerPred.includes("plastic") || lowerPred.includes("water bottle")) {
      return {
        category: "Plastic Bottle",
        confidence: 95,
        recyclable: true,
        instructions: "Rinse the bottle, remove the cap and label, and place in the recycling bin. Caps can be recycled separately.",
        ecoFact: "Recycling one plastic bottle saves enough energy to power a 60W light bulb for 3 hours!",
        aiPrediction: prediction
      };
    }
    
    // Paper/Cardboard
    if (lowerPred.includes("paper") || lowerPred.includes("cardboard") || lowerPred.includes("book") || 
        lowerPred.includes("envelope") || lowerPred.includes("box")) {
      return {
        category: "Paper/Cardboard",
        confidence: 92,
        recyclable: true,
        instructions: "Flatten boxes and keep paper clean and dry. Remove any plastic windows or tape before recycling.",
        ecoFact: "Recycling one ton of paper saves 17 trees and 7,000 gallons of water!",
        aiPrediction: prediction
      };
    }
    
    // Glass
    if (lowerPred.includes("glass") || lowerPred.includes("jar") || lowerPred.includes("wine")) {
      return {
        category: "Glass Container",
        confidence: 94,
        recyclable: true,
        instructions: "Rinse the glass container and remove any lids. Glass can be recycled indefinitely without losing quality!",
        ecoFact: "Glass is 100% recyclable and can be recycled endlessly without loss in quality or purity!",
        aiPrediction: prediction
      };
    }
    
    // Metal cans
    if (lowerPred.includes("can") || lowerPred.includes("tin") || lowerPred.includes("aluminum") || 
        lowerPred.includes("metal")) {
      return {
        category: "Metal Can",
        confidence: 96,
        recyclable: true,
        instructions: "Rinse the can and crush it to save space. Both aluminum and steel cans are recyclable.",
        ecoFact: "Recycling aluminum cans saves 95% of the energy needed to make new cans from raw materials!",
        aiPrediction: prediction
      };
    }
    
    // Electronics
    if (lowerPred.includes("phone") || lowerPred.includes("computer") || lowerPred.includes("laptop") || 
        lowerPred.includes("keyboard") || lowerPred.includes("monitor") || lowerPred.includes("electronic")) {
      return {
        category: "Electronic Device (E-waste)",
        confidence: 91,
        recyclable: true,
        instructions: "This is e-waste! Take it to a designated e-waste collection center. Never throw electronics in regular trash.",
        ecoFact: "E-waste contains valuable materials like gold, silver, and copper that can be recovered and reused!",
        aiPrediction: prediction
      };
    }
    
    // Organic/Food
    if (lowerPred.includes("food") || lowerPred.includes("fruit") || lowerPred.includes("vegetable") || 
        lowerPred.includes("banana") || lowerPred.includes("apple") || lowerPred.includes("orange")) {
      return {
        category: "Organic Waste",
        confidence: 88,
        recyclable: false,
        instructions: "This is organic waste. Consider composting it instead of throwing it away. It's great for gardens!",
        ecoFact: "Composting organic waste reduces methane emissions from landfills and creates nutrient-rich soil!",
        aiPrediction: prediction
      };
    }
    
    // Default: Check if it might be recyclable
    return {
      category: "Unknown Item",
      confidence: 70,
      recyclable: false,
      instructions: "I'm not sure about this item. Please check with your local recycling guidelines or use our Learn section for more information.",
      ecoFact: "When in doubt, it's better to check than to contaminate the recycling stream!",
      aiPrediction: prediction
    };
  };

  const predictCategory = async (imageElement: HTMLImageElement): Promise<ScanResult> => {
    if (!model) {
      throw new Error("Model not loaded");
    }

    // Run prediction
    const predictions = await model.classify(imageElement);
    
    if (predictions && predictions.length > 0) {
      const topPrediction = predictions[0];
      const result = categorizeItem(topPrediction.className);
      result.confidence = Math.round(topPrediction.probability * 100);
      
      // Save scan to localStorage for dashboard
      const scans = JSON.parse(localStorage.getItem("recycleScans") || "[]");
      scans.push({
        date: new Date().toISOString(),
        category: result.category,
        recyclable: result.recyclable,
      });
      localStorage.setItem("recycleScans", JSON.stringify(scans));
      
      return result;
    }
    
    throw new Error("No predictions returned");
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (isLoadingModel || !model) {
      toast.error("AI model is still loading, please wait...");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setResult(null);
      
      // Start scanning
      setIsScanning(true);
      toast.info("🤖 AI is analyzing your image...");
      
      try {
        // Create image element for TensorFlow
        const img = new Image();
        img.src = imageData;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const scanResult = await predictCategory(img);
        setResult(scanResult);
        toast.success("✅ Scan complete!");
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
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">Powered by TensorFlow.js AI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          RecycAI Scanner
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload or capture an image to identify if it&apos;s recyclable with real AI
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-8 mb-8 shadow-custom-lg animate-slide-up">
        <div className="flex flex-col items-center space-y-4">
          {!selectedImage ? (
            <>
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border transition-all hover:border-primary">
                <div className="text-center p-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-float" />
                  <p className="text-muted-foreground mb-2 font-semibold">
                    {isLoadingModel ? "Loading AI model..." : "Ready to scan!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload an image or take a photo
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 gradient-primary"
                  size="lg"
                  disabled={isLoadingModel}
                >
                  <Upload className="mr-2" />
                  Upload Image
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 gradient-secondary"
                  size="lg"
                  disabled={isLoadingModel}
                >
                  <Camera className="mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full aspect-video rounded-lg overflow-hidden animate-bounce-in">
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
        <Card className="p-8 shadow-custom-lg animate-bounce-in">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">AI is analyzing...</p>
            <p className="text-muted-foreground text-center">
              Using TensorFlow.js MobileNet to identify the item
            </p>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !isScanning && (
        <Card className="p-8 shadow-custom-xl animate-bounce-in">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              {result.recyclable ? (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-bounce-in">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 animate-bounce-in">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{result.category}</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  AI detected: <span className="font-semibold">{result.aiPrediction}</span>
                </p>
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

            <div className="border-t pt-6 animate-slide-down">
              <h3 className="font-semibold text-lg mb-2">♻️ Recycling Instructions</h3>
              <p className="text-muted-foreground">{result.instructions}</p>
            </div>

            <div className="border-t pt-6 bg-muted/30 -m-8 p-8 rounded-b-lg animate-slide-down">
              <h3 className="font-semibold text-lg mb-2">🌱 Eco Fact</h3>
              <p className="text-foreground">{result.ecoFact}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Section */}
      <Card className="p-6 mt-8 bg-primary/5 border-primary/20 animate-slide-up">
        <h3 className="font-semibold mb-2">🤖 Real AI Technology</h3>
        <p className="text-sm text-muted-foreground">
          Our scanner uses Google&apos;s TensorFlow.js with the MobileNet model running directly in your browser. 
          The AI has been trained on millions of images to recognize everyday objects. All processing happens 
          on your device - no images are sent to servers, ensuring your privacy!
        </p>
      </Card>
    </div>
  );
};

export default RecycleScanner;
