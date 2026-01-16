import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, ArrowLeft } from "lucide-react";

const MarketAnalysis = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Choose Your Analysis Type</h2>
            <p className="text-muted-foreground text-lg">Quick check or comprehensive plan?</p>
          </div>
          
          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flash Analysis Card */}
            <Card 
              onClick={() => navigate('/market-analysis/flash')} 
              className="cursor-pointer p-6 hover:shadow-lg transition-all hover:border-primary/50"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Flash Analysis</h3>
              <p className="text-sm text-green-600 dark:text-green-400 mb-3">~30 seconds</p>
              <p className="text-muted-foreground mb-4">Quick demographics and sports demand for any ZIP code</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Population & income data</li>
                <li>• Sports demand ranking</li>
                <li>• Market opportunity score</li>
              </ul>
            </Card>

            {/* Full Business Plan Card */}
            <Card 
              onClick={() => navigate('/business-plan')} 
              className="cursor-pointer p-6 hover:shadow-lg transition-all hover:border-primary/50"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Full Business Plan</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">~15 minutes</p>
              <p className="text-muted-foreground mb-4">Create an investor-ready business plan for your facility</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Market & competitive analysis</li>
                <li>• Financial projections</li>
                <li>• Professional PDF export</li>
              </ul>
            </Card>
          </div>
          
          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketAnalysis;
