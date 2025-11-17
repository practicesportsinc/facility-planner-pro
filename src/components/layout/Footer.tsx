import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sports Facility Tools</h3>
            <ul className="space-y-3">
              <li><Link to="/start" className="text-sm text-slate-300 hover:text-white transition-colors">Quick Estimate</Link></li>
              <li><Link to="/wizard/easy" className="text-sm text-slate-300 hover:text-white transition-colors">Easy Wizard</Link></li>
              <li><Link to="/calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Advanced Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/glossary" className="text-sm text-slate-300 hover:text-white transition-colors">Glossary</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/b2b" className="text-sm text-slate-300 hover:text-white transition-colors">B2B Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-slate-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/b2b/partnerships" className="text-sm text-slate-300 hover:text-white transition-colors">Partnerships</Link></li>
              <li><Link to="/b2b/contact" className="text-sm text-slate-300 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/legal" className="text-sm text-slate-300 hover:text-white transition-colors">Legal & Privacy</Link></li>
              <li><a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1"><Calendar className="h-3 w-3" />Schedule Consultation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-primary mt-0.5" />
                <div><p className="text-sm font-medium">Practice Sports, Inc.</p><p className="text-xs text-slate-400">SportsFacility.ai</p></div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <a href="https://maps.google.com/?q=14706+Giles+Rd+Omaha+NE+68138" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white">14706 Giles Rd, Omaha, NE 68138</a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm text-slate-300"><a href="tel:8008776787" className="hover:text-white">800.877.6787</a> | <a href="tel:4025922000" className="hover:text-white">402.592.2000</a></div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm space-y-1"><a href="mailto:info@practicesports.com" className="text-slate-300 hover:text-white block">info@practicesports.com</a><a href="https://practicesports.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white block">practicesports.com</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Practice Sports, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
