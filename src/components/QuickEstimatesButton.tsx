import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Zap } from "lucide-react";
import { QuickEstimateFlow } from "./QuickEstimateFlow";

export const QuickEstimatesButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-primary text-white border-0 hover:bg-gradient-primary/90 shadow-glow"
        >
          <Zap className="h-4 w-4 mr-2" />
          Quick Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 border-0">
        <QuickEstimateFlow onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default QuickEstimatesButton;