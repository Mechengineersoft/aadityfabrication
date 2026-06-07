import { useEffect } from "react";
import { Link } from "wouter";
import { MapPin, Clock, Award, Users, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TrustBadges from "@/components/TrustBadges";

const milestones = [
  { year: "2012", label: "Founded", desc: "Established in Kallubalu, Bangalore with a focus on structural fabrication." },
  { year: "2015", label: "EOT Cranes", desc: "Expanded into Electric Overhead Traveling crane manufacturing." },
  { year: "2018", label: "Growth", desc: "Scaled to 50+ industrial shed projects across Bangalore and Karnataka." },
  { year: "2024", label: "Today", desc: "12 years of service, 200+ projects completed, verified on Justdial." },
];

const stats = [
  { value: "12+", label: "Years in Business" },
  { value: "200+", label: "Projects Completed" },
  { value: "50T", label: "Max Crane Capacity" },
  { value: "24h", label: "Quote Turnaround" },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Aadity Fabrication Works | 12 Years in Bangalore";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Aadity Fabrication Works — 12 years of industrial fabrication expertise in Kallubalu, Bangalore. EOT cranes, industrial sheds, gantry cranes.");
  }, []);

  return (
    <div>
      {/* Header */}
      <section className="steel-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">About Us</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            12 years of precision fabrication in Bangalore's industrial heartland.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <div className="prose prose-sm text-muted-foreground space-y-4">
                <p>
                  Founded in 2012, Aadity Fabrication Works has spent over a decade serving Bangalore's industrial sector from our manufacturing facility beside Nandana Layout, Kallubalu. What started as a general fabrication shop has grown into a full-service crane and shed fabrication company trusted by factories, warehouses, and construction companies across Karnataka.
                </p>
                <p>
                  Our facility is equipped for the full lifecycle of industrial crane manufacturing — from structural steel cutting and forming to electrical panel assembly, painting, and site commissioning. We manufacture EOT cranes from 1T to 50T capacity and install industrial sheds spanning up to 60 metres.
                </p>
                <p>
                  Over 12 years, we have earned the trust of our clients not through advertising but through on-time delivery, honest pricing, and work that holds up under continuous industrial use. Our after-sales rework and modernization services keep equipment running for decades.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact">
                  <Button className="bg-accent hover:bg-accent/90 text-white font-semibold">
                    Get in Touch <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Our Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Location & Info */}
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-base">Business Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Manufacturing Facility</p>
                        <p className="text-muted-foreground">Beside Nandana Layout, Kallubalu, Bangalore</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-muted-foreground">Monday to Saturday — Open until 6:00 pm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Business Type</p>
                        <p className="text-muted-foreground">Manufacturer — Fabricators & Shed Fabricators</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-muted-foreground">Industrial Fabrication, Crane Manufacturing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card className="border-border">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-3">Manufacturing Capabilities</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "EOT Crane fabrication — 1T to 50T",
                      "Industrial sheds — up to 60m span",
                      "MIG, TIG, and arc welding",
                      "Electrical panel assembly & wiring",
                      "Sandblasting and industrial painting",
                      "VFD drive installation and commissioning",
                      "On-site installation and testing",
                    ].map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <Wrench className="w-3 h-3 text-accent shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-14 bg-muted/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Journey</h2>
          <div className="relative border-l-2 border-accent/30 pl-6 space-y-8">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <div className="absolute -left-8 top-0 w-4 h-4 bg-accent rounded-full border-2 border-background" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{m.year}</span>
                <h3 className="font-semibold mt-0.5">{m.label}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>
    </div>
  );
}
