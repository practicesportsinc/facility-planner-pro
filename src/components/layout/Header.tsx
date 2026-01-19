import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, MessageCircle, Home as HomeIcon, Building2, HardHat, MapPin, TrendingUp } from "lucide-react";
import { FlashMarketInput } from "@/components/market/FlashMarketInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Baseball icon SVG component
const BaseballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M6 8c3 3 3 5 0 8" />
    <path d="M18 8c-3 3-3 5 0 8" />
  </svg>
);
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
  const navigate = useNavigate();
  const { openChat } = useChat();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileZipCode, setMobileZipCode] = useState("");
  const [dialogZipCode, setDialogZipCode] = useState("");
  const [marketDialogOpen, setMarketDialogOpen] = useState(false);

  const handleDialogMarketSubmit = () => {
    if (dialogZipCode.length === 5) {
      setMarketDialogOpen(false);
      navigate(`/market-analysis/flash?zip=${dialogZipCode}`);
      setDialogZipCode("");
    }
  };

  const handleMobileMarketSubmit = () => {
    if (mobileZipCode.length === 5) {
      setMobileMenuOpen(false);
      navigate(`/market-analysis/flash?zip=${mobileZipCode}`);
      setMobileZipCode("");
    }
  };

  const isActive = (path: string, mode?: string) => {
    if (mode) {
      const params = new URLSearchParams(location.search);
      return location.pathname === path && params.get('mode') === mode;
    }
    return location.pathname === path && !new URLSearchParams(location.search).get('mode');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/30 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
        <div className="container flex h-28 md:h-32 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 -ml-2 md:-ml-4 self-center">
            <img 
              src="/images/sportsfacility-logo.png?v=6"
              alt="SportsFacility.ai - Building the future of modern sports facilities" 
              className="h-20 md:h-24 w-auto object-contain object-center -mt-1 md:-mt-2"
            />
          </Link>

          {/* Desktop Navigation + Flash Market */}
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
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
                      <BaseballIcon className="h-4 w-4" />
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
                      location.pathname === '/market-analysis'
                        ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                        : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                    }`}
                  >
                    <Link to="/market-analysis" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Market Analysis / Biz Plan
                    </Link>
                  </Button>
                </NavigationMenuItem>
            </NavigationMenuList>
            </NavigationMenu>

            {/* Flash Market Icon + Dialog - visible md to lg */}
            <Dialog open={marketDialogOpen} onOpenChange={setMarketDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="xl:hidden bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow"
                  title="Flash Market Review"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Flash Market Review
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Enter a ZIP code to get instant market analysis for your sports facility.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter ZIP code"
                      className="flex-1 h-10 bg-background border-cyan-500/30"
                      value={dialogZipCode}
                      onChange={(e) => setDialogZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={(e) => e.key === 'Enter' && handleDialogMarketSubmit()}
                      autoFocus
                    />
                    <Button
                      className="h-10 px-6 bg-cyan-600 hover:bg-cyan-500 text-white"
                      onClick={handleDialogMarketSubmit}
                      disabled={dialogZipCode.length !== 5}
                    >
                      Analyze
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Flash Market Input - Desktop XL+ inline */}
            <div className="hidden xl:flex items-center pl-4 border-l border-cyan-500/30">
              <FlashMarketInput />
            </div>
          </div>

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
                {/* Flash Market Input - Mobile */}
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">Flash Market Review</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter ZIP code"
                      className="flex-1 h-10 text-sm bg-black/40 border-cyan-500/30"
                      value={mobileZipCode}
                      onChange={(e) => setMobileZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={(e) => e.key === 'Enter' && handleMobileMarketSubmit()}
                    />
                    <Button
                      size="sm"
                      className="h-10 px-4 bg-cyan-600 hover:bg-cyan-500 text-white"
                      onClick={handleMobileMarketSubmit}
                      disabled={mobileZipCode.length !== 5}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t border-cyan-500/20 pt-4">
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
                </div>

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
                    <BaseballIcon className="h-5 w-5" />
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
                    location.pathname === '/market-analysis'
                      ? 'bg-gradient-primary text-white hover:bg-gradient-primary/90 hover:text-white'
                      : 'bg-gradient-primary/60 text-white/80 hover:bg-gradient-primary/80 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/market-analysis" className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Analysis / Biz Plan
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
