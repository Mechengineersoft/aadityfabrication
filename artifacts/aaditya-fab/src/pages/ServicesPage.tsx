import { useEffect } from "react";
import { Link } from "wouter";
import { Wrench, Building2, Settings, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListServices } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  crane: Wrench,
  shed: Building2,
  fabrication: Settings,
};

const SERVICES_DETAIL = [
  {
    slug: "eot-cranes",
    specs: ["Capacity: 1T to 100T", "Span: 5m to 50m", "Lift Height: up to 30m", "Single & Double Girder", "Class II to Class IV duty"],
    highlights: ["Design & manufacture", "Supply & installation", "Electrical panel wiring", "Commissioning & testing"],
  },
  {
    slug: "industrial-sheds",
    specs: ["Span up to 60m", "Material: IS 2062 steel", "Wind load as per IS:875", "PEB / conventional design", "Colour-coated sheets"],
    highlights: ["Foundation to roof", "GI/colour-coated sheets", "Mezzanine floors", "Skylight & ventilators"],
  },
  {
    slug: "shed-rework",
    specs: ["Re-roofing", "Structural strengthening", "Bay extension", "Column reinforcement", "Drainage correction"],
    highlights: ["Damage assessment", "Load capacity upgrade", "Sheet replacement", "Purlin replacement"],
  },
  {
    slug: "crane-rework",
    specs: ["VFD drive installation", "Panel upgrades", "End carriage replacement", "Hoist mechanism repair", "Electrical rewiring"],
    highlights: ["Retrofit & modernization", "Safety device upgrades", "Motor replacement", "CGL compliance"],
  },
  {
    slug: "gantry-cranes",
    specs: ["Capacity: 1T to 50T", "Fixed & mobile types", "Rubber-tyred gantry", "Manual & motorised", "Rail-mounted systems"],
    highlights: ["New manufacture", "Rework & repair", "Custom span design", "Installation on-site"],
  },
  {
    slug: "general-fabrication",
    specs: ["MS / SS / alloy steel", "MIG, TIG, arc welding", "Sandblasting & painting", "CNC cutting available", "IS standard fabrication"],
    highlights: ["Custom structures", "Staircases & platforms", "Pipe & vessel fabrication", "Industrial gates & doors"],
  },
];

export default function ServicesPage() {
  useEffect(() => {
    document.title = "Services | EOT Cranes & Shed Fabrication Bangalore | Aaditya Fabrication Works";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "EOT crane manufacturing, industrial shed construction, shed rework, crane rework, gantry cranes, and general fabrication in Bangalore.");
  }, []);

  const { data: services, isLoading } = useListServices();

  return (
    <div>
      {/* Header */}
      <section className="steel-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Our Services</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Comprehensive fabrication services for Bangalore's industrial sector — from new manufacturing to rework and modernization.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(services ?? []).map((svc) => {
                const detail = SERVICES_DETAIL.find((d) => d.slug === svc.slug);
                const Icon = serviceIcons[svc.icon] ?? Wrench;
                return (
                  <Card key={svc.id} className="border-border hover:shadow-md transition-shadow" data-testid={`service-detail-${svc.slug}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <CardTitle className="text-xl">{svc.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">{svc.fullDescription}</p>
                      {detail && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Specifications</h4>
                            <ul className="space-y-1">
                              {detail.specs.map((s) => (
                                <li key={s} className="text-xs text-foreground flex items-start gap-1.5">
                                  <span className="text-accent mt-0.5">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">We Provide</h4>
                            <ul className="space-y-1">
                              {detail.highlights.map((h) => (
                                <li key={h} className="text-xs text-foreground flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-accent shrink-0" /> {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      <Link href={`/contact?service=${encodeURIComponent(svc.name)}`}>
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-medium" data-testid={`service-quote-${svc.slug}`}>
                          Request Quote <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
