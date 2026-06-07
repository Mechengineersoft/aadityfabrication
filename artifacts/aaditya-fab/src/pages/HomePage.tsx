import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Wrench, Building2, Settings, ChevronRight, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TrustBadges from "@/components/TrustBadges";
import { useListServices } from "@workspace/api-client-react";

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  crane: Wrench,
  shed: Building2,
  fabrication: Settings,
};

const SERVICES_FALLBACK = [
  { id: 1, name: "EOT Cranes", slug: "eot-cranes", shortDescription: "Electric Overhead Traveling cranes — manufacturing, supply, installation & commissioning.", icon: "crane" },
  { id: 2, name: "Industrial Sheds", slug: "industrial-sheds", shortDescription: "Complete fabrication of company sheds, factory roofing, and industrial structures.", icon: "shed" },
  { id: 3, name: "Shed Rework", slug: "shed-rework", shortDescription: "Repair, expansion, reinforcement, and re-roofing of existing industrial sheds.", icon: "shed" },
  { id: 4, name: "Crane Rework", slug: "crane-rework", shortDescription: "Panel upgrades, VFD installation, end carriage replacement, and modernization.", icon: "crane" },
  { id: 5, name: "Gantry Cranes", slug: "gantry-cranes", shortDescription: "Mobile and fixed gantry cranes — new manufacturing and repair/rework.", icon: "crane" },
  { id: 6, name: "General Fabrication", slug: "general-fabrication", shortDescription: "Custom metalwork, structural steel, and bespoke industrial fabrication.", icon: "fabrication" },
];

export default function HomePage() {
  useEffect(() => {
    document.title = "Aadity Fabrication Works | EOT Cranes & Industrial Sheds Bangalore";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Aadity Fabrication Works — 12 years of EOT crane manufacturing, industrial shed fabrication, and gantry crane services in Kallubalu, Bangalore.");
  }, []);

  const { data: services } = useListServices();
  const displayServices = (services && services.length > 0) ? services : SERVICES_FALLBACK;

  return (
    <div>
      {/* Hero */}
      <section className="relative steel-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.1) 40px, rgba(255,255,255,.1) 41px)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              12 Years in Business — Established 2012
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Aadity Fabrication Works
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-2">
              EOT Cranes &bull; Industrial Sheds &bull; Gantry Cranes &bull; Fabrication
            </p>
            <p className="text-white/60 text-lg mb-8">
              Bangalore's trusted heavy fabrication specialist — Kallubalu, Bangalore
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-6" data-testid="hero-quote-btn">
                  Get a Free Quote <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium px-6">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative bg-primary/50 py-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" /> Beside Nandana Layout, Kallubalu, Bangalore</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-accent" /> +91-9019-565420</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" /> Open until 6:00 pm</span>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-muted/40 py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Our Services</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              End-to-end fabrication solutions for Bangalore's industrial sector
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((svc) => {
              const Icon = serviceIcons[svc.icon] ?? Wrench;
              return (
                <Card key={svc.id} className="group hover:shadow-md transition-shadow border-border" data-testid={`service-card-${svc.id}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{svc.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{svc.shortDescription}</p>
                    <Link href="/contact">
                      <button className="text-accent text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                        Request Quote <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Services <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="steel-gradient text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Start Your Project?</h2>
          <p className="text-white/70 mb-6 text-lg">
            Get a detailed technical quote within 24 hours. Tell us your requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8" data-testid="cta-quote-btn">
                Get Free Quote
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Crane Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
