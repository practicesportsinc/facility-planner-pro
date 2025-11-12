import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Zap } from "lucide-react";
import { QuickEstimateFlow } from "./QuickEstimateFlow";

export const QuickEstimatesButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    console.log('Quick Estimate Dialog state changing to:', open);
    setIsOpen(open);
  };

  const handleClick = () => {
    console.log('Quick Estimate button clicked!');
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClick}
          className="bg-gradient-primary text-white border-0 hover:bg-gradient-primary/90 shadow-glow"
        >
          <Zap className="h-4 w-4 mr-2" />
          Quick Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 border-0 z-[100]">
        <QuickEstimateFlow onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default QuickEstimatesButton;