import { ReactNode } from "react";
import Header from "./Header";
import { SiteBreadcrumbs } from "@/components/navigation/SiteBreadcrumbs";
import { WizardStepNav } from "@/components/navigation/WizardStepNav";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  showWizardNav?: boolean;
}

const Layout = ({ 
  children, 
  className = "", 
  showBreadcrumbs = true,
  showWizardNav = false 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      {showBreadcrumbs && <SiteBreadcrumbs />}
      {showWizardNav && <WizardStepNav />}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;