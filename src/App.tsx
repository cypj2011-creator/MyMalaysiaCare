import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";

const Home = lazy(() => import("./pages/Home"));
const RecycleScanner = lazy(() => import("./pages/RecycleScanner"));
const InteractiveMap = lazy(() => import("./pages/InteractiveMap"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppFallback = () => (
  <main className="min-h-[60vh] flex items-center justify-center bg-background">
    <div className="flex items-center gap-3 text-primary">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm font-medium">Loading MyMalaysiaCare...</span>
    </div>
  </main>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Header />
        <Suspense fallback={<AppFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/recycle" element={<RecycleScanner />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
        <ChatBot />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
