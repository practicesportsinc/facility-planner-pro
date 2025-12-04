import Layout from "@/components/layout/Layout";
import { BuildingConfigWizard } from "@/components/building/BuildingConfigWizard";
import { Building } from "lucide-react";

export default function BuildingConfig() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Building className="h-5 w-5" />
              <span className="font-medium">Building Configuration Wizard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Configure Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Metal Building
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your building dimensions, select doors and finish levels to generate 
              an itemized construction cost estimate for your pre-engineered metal building.
            </p>
          </div>

          {/* Wizard */}
          <BuildingConfigWizard />
        </div>
      </div>
    </Layout>
  );
}
