import { useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    icon?: React.ComponentType<any>;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  "": { label: "Home", icon: Home },
  "start": { label: "Start" },
  "wizard": { label: "Wizard" },
  "wizard-results": { label: "Results" },
  "calculator": { label: "Calculator" },
  "glossary": { label: "Glossary" },
  "admin": { label: "Admin" },
  "legal": { label: "Legal" },
};

export function SiteBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb path
  const breadcrumbs = [''].concat(pathSegments.map((_, index) => 
    pathSegments.slice(0, index + 1).join('/')
  ));

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="px-6 py-3 border-b border-border bg-muted/30">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((path, index) => {
            const config = breadcrumbConfig[path] || { label: path.split('/').pop() || path };
            const isLast = index === breadcrumbs.length - 1;
            const href = path === '' ? '/' : `/${path}`;
            const Icon = config.icon;

            return (
              <BreadcrumbItem key={path}>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {Icon && <Icon className="h-4 w-4" />}
                    {config.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink 
                      href={href}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {config.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}