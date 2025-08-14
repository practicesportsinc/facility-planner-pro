import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Settings, FileText, Sparkles, Zap } from "lucide-react";
import QuickEstimatesButton from "@/components/QuickEstimatesButton";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">PracticeSports</span>
            <span className="text-xs text-muted-foreground">Facility Calculator</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-smooth ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/calculator" 
            className={`text-sm font-medium transition-smooth ${
              isActive('/calculator') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Calculator
          </Link>
          <Link 
            to="/wizard" 
            className={`text-sm font-medium transition-smooth ${
              isActive('/wizard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-1" />
            Facility Wizard
          </Link>
          <QuickEstimatesButton />
          <Link 
            to="/admin" 
            className={`text-sm font-medium transition-smooth ${
              isActive('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Admin
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/legal">
              <FileText className="h-4 w-4 mr-2" />
              Legal
            </Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/calculator">Start Calculator</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;