
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, Menu, Sparkles, MessageCircle } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuickEstimateFlow } from "@/components/QuickEstimateFlow";

const Header = () => {
  const location = useLocation();
  const { openChat } = useChat();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickEstimateOpen, setQuickEstimateOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/30 bg-black">
        <div className="container flex h-36 md:h-44 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/sportsfacility-logo.png" 
              alt="SportsFacility.ai - Building the future of modern sports facilities" 
              className="h-32 md:h-40 w-auto object-contain"
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
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <Link to="/">Home</Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openChat()}
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickEstimateOpen(true)}
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Estimate
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <Link to="/wizard/easy/start" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Easy Wizard
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
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
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/">Home</Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openChat();
                  }}
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setQuickEstimateOpen(true);
                  }}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Estimate
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/wizard/easy/start" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Easy Wizard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
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

      <Dialog open={quickEstimateOpen} onOpenChange={setQuickEstimateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 border-0 z-[100]">
          <QuickEstimateFlow onClose={() => setQuickEstimateOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
