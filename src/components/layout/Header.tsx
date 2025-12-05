
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle, Home as HomeIcon, Wrench, Building2, HardHat, FileText } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
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
  const { openChat } = useChat();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string, mode?: string) => {
    if (mode) {
      const params = new URLSearchParams(location.search);
      return location.pathname === path && params.get('mode') === mode;
    }
    return location.pathname === path && !new URLSearchParams(location.search).get('mode');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/30 bg-black">
        <div className="container flex h-36 md:h-44 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/sportsfacility-logo.png?v=3" 
              alt="SportsFacility.ai - Building the future of modern sports facilities" 
              className="h-32 md:h-40 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <Button
                  size="sm"
                  asChild
                  className={`shadow-glow transition-all ${
                    isActive('/')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                >
                  <Link to="/" className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  size="sm"
                  asChild
                  className={`shadow-glow transition-all ${
                    isActive('/', 'equipment')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                >
                  <Link to="/?mode=equipment" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Equipment Only
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  size="sm"
                  asChild
                  className={`shadow-glow transition-all ${
                    location.pathname === '/building-config'
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                >
                  <Link to="/building-config" className="flex items-center gap-2">
                    <HardHat className="h-4 w-4" />
                    Building Only
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  size="sm"
                  asChild
                  className={`shadow-glow transition-all ${
                    isActive('/', 'facility')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                >
                  <Link to="/?mode=facility" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Full Facility
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  size="sm"
                  asChild
                  className={`shadow-glow transition-all ${
                    location.pathname === '/business-plan'
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                >
                  <Link to="/business-plan" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Business Plan
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
                className="md:hidden bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
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
                  size="lg"
                  asChild
                  className={`w-full justify-start shadow-glow ${
                    isActive('/')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/" className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    Home
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  className={`w-full justify-start shadow-glow ${
                    isActive('/', 'equipment')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/?mode=equipment" className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipment Only
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  className={`w-full justify-start shadow-glow ${
                    location.pathname === '/building-config'
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/building-config" className="flex items-center gap-2">
                    <HardHat className="h-5 w-5" />
                    Building Only
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  className={`w-full justify-start shadow-glow ${
                    isActive('/', 'facility')
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/?mode=facility" className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Full Facility
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  className={`w-full justify-start shadow-glow ${
                    location.pathname === '/business-plan'
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/business-plan" className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Business Plan
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
