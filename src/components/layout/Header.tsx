
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle, LayoutGrid, Sparkles } from "lucide-react";
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

  const isActive = (path: string) => location.pathname === path;

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
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <Link to="/gallery" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Gallery Designer
                  </Link>
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
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                >
                  <Link to="/start" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get Estimates
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
                  <Link to="/gallery" className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    Gallery Designer
                  </Link>
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
                  asChild
                  className="w-full justify-start bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/start" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Get Estimates
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
