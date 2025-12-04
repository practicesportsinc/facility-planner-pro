import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { GlobalChatWidget } from "./components/chat/GlobalChatWidget";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Start from "./pages/Start";
import About from "./pages/About";
import Wizard from "./pages/Wizard";
import WizardResults from "./pages/WizardResults";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Legal from "./pages/Legal";
import Calculator from "./pages/Calculator";
import Glossary from "./pages/Glossary";
import NotFound from "./pages/NotFound";
import EasyWizard from "./pages/wizard/EasyWizard";
import SharedReport from "./pages/SharedReport";
import FAQ from "./pages/FAQ";
import B2B from "./pages/b2b/B2B";
import Partnerships from "./pages/b2b/Partnerships";
import B2BContact from "./pages/b2b/Contact";
import B2BPricing from "./pages/b2b/Pricing";
import BuildingConfig from "./pages/BuildingConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/start" element={<Start />} />
              <Route path="/about" element={<About />} />
              <Route path="/wizard" element={<Wizard />} />
              <Route path="/wizard/easy/*" element={<EasyWizard />} />
              <Route path="/wizard-results" element={<WizardResults />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/glossary/:slug" element={<Glossary />} />
              <Route path="/report/:id" element={<SharedReport />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/b2b" element={<B2B />} />
              <Route path="/b2b/partnerships" element={<Partnerships />} />
              <Route path="/b2b/contact" element={<B2BContact />} />
              <Route path="/b2b/pricing" element={<B2BPricing />} />
              <Route path="/building-config" element={<BuildingConfig />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </ChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
