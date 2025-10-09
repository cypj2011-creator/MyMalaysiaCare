import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RecycleScanner from "./pages/RecycleScanner";
import InteractiveMap from "./pages/InteractiveMap";
import Dashboard from "./pages/Dashboard";
import Protect from "./pages/Protect";
import Safety from "./pages/Safety";
import Learn from "./pages/Learn";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recycle" element={<RecycleScanner />} />
          <Route path="/map" element={<InteractiveMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/protect" element={<Protect />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
