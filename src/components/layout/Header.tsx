
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Sparkles, HelpCircle, Briefcase, ChevronDown } from "lucide-react";
import { QuickEstimatesButton } from "@/components/QuickEstimatesButton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
                  <Link to="/wizard" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Wizard
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

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black hover:border hover:border-primary/30"
                >
                  <Link to="/faq" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-gradient-primary text-white border-0 shadow-glow hover:bg-white hover:text-black data-[state=open]:bg-white data-[state=open]:text-black h-9 px-3 text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  B2B
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-1 p-2 bg-background">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/b2b/partnerships"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Partnerships</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                            Partner programs
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/b2b/contact"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Contact</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                            Get in touch
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/b2b/pricing"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Pricing</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                            Custom solutions
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <QuickEstimatesButton />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
};

export default Header;
