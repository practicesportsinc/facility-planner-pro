import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Settings, FileText, Sparkles, Zap } from "lucide-react";
import { QuickEstimatesButton } from "@/components/QuickEstimatesButton";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
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

          <nav className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className={`${
                isActive('/') 
                  ? 'bg-gradient-primary text-white border-0 shadow-glow' 
                  : 'bg-gradient-primary/10 text-primary border-primary/30 hover:bg-gradient-primary hover:text-white hover:border-0'
              }`}
            >
              <Link to="/">
                Home
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className={`${
                isActive('/wizard') 
                  ? 'bg-gradient-primary text-white border-0 shadow-glow' 
                  : 'bg-gradient-primary/10 text-primary border-primary/30 hover:bg-gradient-primary hover:text-white hover:border-0'
              }`}
            >
              <Link to="/wizard" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Wizard
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className={`${
                isActive('/calculator') 
                  ? 'bg-gradient-primary text-white border-0 shadow-glow' 
                  : 'bg-gradient-primary/10 text-primary border-primary/30 hover:bg-gradient-primary hover:text-white hover:border-0'
              }`}
            >
              <Link to="/calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculator
              </Link>
            </Button>

            <QuickEstimatesButton />
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className={`${
                isActive('/admin') 
                  ? 'bg-gradient-primary text-white border-0 shadow-glow' 
                  : 'bg-gradient-primary/10 text-primary border-primary/30 hover:bg-gradient-primary hover:text-white hover:border-0'
              }`}
            >
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="hidden md:flex bg-gradient-primary/10 text-primary border-primary/30 hover:bg-gradient-primary hover:text-white hover:border-0"
            >
              <Link to="/legal" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Legal
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;