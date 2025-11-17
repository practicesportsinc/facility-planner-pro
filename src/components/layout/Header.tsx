
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-28 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/206e396b-a0aa-474d-bf77-f74fe8aa90fc.png" 
              alt="Sports Facility.ai" 
              className="h-24 md:h-28 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
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

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden bg-gradient-primary text-white border-0 shadow-glow"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/">Home</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/start" className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Get Started
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/calculator" className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculator
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
};

export default Header;
