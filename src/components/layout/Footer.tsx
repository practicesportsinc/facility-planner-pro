import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Company Info */}
          <div className="text-center md:text-left space-y-1">
            <p className="font-semibold">SportsFacility.ai | Practice Sports, Inc.</p>
            <p className="text-sm text-muted-foreground">
              <a href="https://practicesports.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                practicesports.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">14706 Giles Rd. Omaha, NE 68138</p>
            <p className="text-sm text-muted-foreground">
              <a href="tel:8008776787" className="hover:underline">800.877.6787</a> | <a href="tel:4025922000" className="hover:underline">402.592.2000</a>
            </p>
          </div>

          {/* CTA Button */}
          <Button variant="default" size="lg" asChild>
            <a 
              href="https://practicesportsinc.setmore.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Schedule meeting with facility expert
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
