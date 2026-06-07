import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Wrench className="w-6 h-6 text-accent" />
            <span>Aadity <span className="text-accent">Fabrication</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  location === l.href
                    ? "bg-accent text-white"
                    : "hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/contact">
              <Button className="ml-2 bg-accent hover:bg-accent/90 text-white font-semibold" size="sm" data-testid="nav-quote-btn">
                Get Free Quote
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded hover:bg-white/10"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                location === l.href ? "bg-accent text-white" : "hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)}>
            <Button className="mt-2 w-full bg-accent hover:bg-accent/90 text-white font-semibold" size="sm">
              Get Free Quote
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
