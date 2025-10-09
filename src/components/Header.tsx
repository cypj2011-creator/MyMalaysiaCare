import { Link, useLocation } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/recycle", label: "RecycAI" },
    { path: "/map", label: "Map" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/protect", label: "Protect" },
    { path: "/safety", label: "Safety" },
    { path: "/learn", label: "Learn" },
    { path: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center animate-float">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MyMalaysia Care+
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={isActive(item.path) ? "gradient-primary text-white" : ""}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.path) ? "gradient-primary text-white" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
