import { Link } from "wouter";
import { MapPin, Clock, Phone, Wrench, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Wrench className="w-5 h-5 text-accent" />
              <span>Aadity <span className="text-accent">Fabrication</span></span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              12 years of precision engineering in Bangalore. EOT cranes, industrial sheds, and heavy fabrication.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["12 Years", "Verified Business", "Bangalore"].map((b) => (
                <span key={b} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-accent mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {["EOT Cranes", "Industrial Sheds", "Shed Rework", "Crane Rework", "Gantry Cranes", "General Fabrication"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="hover:text-accent transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { href: "/products", label: "Crane Products" },
                { href: "/projects", label: "Project Gallery" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Request Quote" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-accent mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Beside Nandana Layout, Kallubalu, Bangalore</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>+91-9019-565420</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>aadityfabricationworks@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <span>Mon–Sat, Open until 6:00 pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Aadity Fabrication Works. All rights reserved.</p>
          <p>Kallubalu, Bangalore — Est. 2012</p>
        </div>
      </div>
    </footer>
  );
}
