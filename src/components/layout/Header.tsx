
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Zap } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/206e396b-a0aa-474d-bf77-f74fe8aa90fc.png" 
              alt="Sports Facility.ai" 
              width="240"
              height="80"
              className={`w-auto bg-transparent ${location.pathname === '/' ? 'h-21 md:h-24 lg:h-30' : 'h-18 md:h-21 lg:h-24'}`}
            />
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black hover:border hover:border-primary/30"
                >
                  <Link to="/">Home</Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black hover:border hover:border-primary/30"
                >
                  <Link to="/start" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black hover:border hover:border-primary/30"
                >
                  <Link to="/calculator" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculator
                  </Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
};

export default Header;
