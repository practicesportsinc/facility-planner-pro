import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FlashMarketInput = () => {
  const [zipCode, setZipCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (zipCode.length === 5) {
      navigate(`/market-analysis?zip=${zipCode}`);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-400/80 font-medium hidden xl:block">
              Flash Market
            </span>
            <Input
              type="text"
              placeholder="ZIP"
              className="w-20 h-8 text-sm bg-black/40 border-cyan-500/30 text-white placeholder:text-white/50 focus:border-cyan-400"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
              onClick={handleSubmit}
              disabled={zipCode.length !== 5}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Enter ZIP for instant market analysis</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
