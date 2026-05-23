import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Disclaimer } from "./Disclaimer";

export const SUPPORT_EMAIL = "support@settlemate.app";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div>
            <h3 className="text-base font-bold text-primary mb-2">SettleMate</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your guide through every step of relocating to Italy as an international student.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/visa-wizard" className="text-muted-foreground hover:text-primary">Visa Wizard</Link></li>
              <li><Link to="/arrival-italy" className="text-muted-foreground hover:text-primary">Arrival in Italy</Link></li>
              <li><Link to="/social-integration" className="text-muted-foreground hover:text-primary">Social Integration</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Disclaimer variant="inline" className="mb-4" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t text-xs text-muted-foreground">
          <p>© {year} SettleMate. All rights reserved.</p>
          <p>
            We use only essential cookies required to keep you signed in. No third-party tracking.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
