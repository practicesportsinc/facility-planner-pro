import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Start from "./pages/Start";
import Wizard from "./pages/Wizard";
import WizardResults from "./pages/WizardResults";
import Admin from "./pages/Admin";
import Legal from "./pages/Legal";
import Calculator from "./pages/Calculator";
import Glossary from "./pages/Glossary";
import NotFound from "./pages/NotFound";
import EasyWizard from "./pages/wizard/EasyWizard";
import SharedReport from "./pages/SharedReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<Start />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/wizard/easy/*" element={<EasyWizard />} />
          <Route path="/wizard-results" element={<WizardResults />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/glossary/:slug" element={<Glossary />} />
          <Route path="/report/:id" element={<SharedReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
