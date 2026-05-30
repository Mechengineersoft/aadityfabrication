import { Shield, Award, MapPin, CheckCircle } from "lucide-react";

const badges = [
  { icon: Award, label: "12 Years in Business", sub: "Est. 2012" },
  { icon: Shield, label: "Verified Business", sub: "Justdial Claimed" },
  { icon: MapPin, label: "Bangalore Based", sub: "Kallubalu, Bangalore" },
  { icon: CheckCircle, label: "Industrial Experts", sub: "Cranes & Sheds" },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((b) => (
        <div
          key={b.label}
          className="bg-card border border-border rounded-lg p-4 flex flex-col items-center text-center shadow-sm"
          data-testid={`trust-badge-${b.label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <b.icon className="w-7 h-7 text-accent mb-2" />
          <p className="font-semibold text-sm text-foreground">{b.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{b.sub}</p>
        </div>
      ))}
    </div>
  );
}
