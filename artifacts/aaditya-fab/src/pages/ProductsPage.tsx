import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Wrench, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const CRANE_MODELS = [
  { capacity: 5, model: "AFW-5T-SG", type: "Single Girder EOT", span: [5, 15], liftHeight: [3, 9], weight: "1.2T", motor: "2.2 kW x2", speed: "20 m/min" },
  { capacity: 10, model: "AFW-10T-SG", type: "Single Girder EOT", span: [6, 20], liftHeight: [3, 12], weight: "2.8T", motor: "5.5 kW x2", speed: "16 m/min" },
  { capacity: 20, model: "AFW-20T-DG", type: "Double Girder EOT", span: [8, 30], liftHeight: [6, 18], weight: "7.5T", motor: "11 kW x2", speed: "12 m/min" },
  { capacity: 50, model: "AFW-50T-DG", type: "Double Girder EOT", span: [12, 45], liftHeight: [6, 24], weight: "22T", motor: "30 kW x2", speed: "8 m/min" },
];

function getRecommendedCrane(capacity: number, span: number) {
  return CRANE_MODELS.find(
    (m) => m.capacity >= capacity && span >= m.span[0] && span <= m.span[1],
  ) ?? null;
}

export default function ProductsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "EOT Crane Products | 5T to 50T | Aaditya Fabrication Works Bangalore";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "EOT crane manufacturing in Bangalore — single and double girder, 5T to 50T capacity. Technical specs, load charts, and free quote.");
  }, []);

  const [capacity, setCapacity] = useState("10");
  const [span, setSpan] = useState([15]);
  const recommended = getRecommendedCrane(Number(capacity), span[0]);

  const handleRequestQuote = () => {
    setLocation(`/contact?service=EOT+Crane&capacity=${capacity}&span=${span[0]}`);
  };

  return (
    <div>
      {/* Header */}
      <section className="steel-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold">Crane Products</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            Manufactured in Bangalore — IS standard EOT cranes from 5T to 50T capacity.
          </p>
        </div>
      </section>

      {/* Load Chart Calculator */}
      <section className="py-12 bg-muted/40 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Load Chart Calculator</h2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Required Capacity (Tonnes)</Label>
                <Select value={capacity} onValueChange={setCapacity} data-testid="calc-capacity">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Tonnes</SelectItem>
                    <SelectItem value="10">10 Tonnes</SelectItem>
                    <SelectItem value="20">20 Tonnes</SelectItem>
                    <SelectItem value="50">50 Tonnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Span Required: <span className="text-accent font-semibold">{span[0]} metres</span>
                </Label>
                <Slider
                  min={5}
                  max={45}
                  step={1}
                  value={span}
                  onValueChange={setSpan}
                  className="mt-3"
                  data-testid="calc-span"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 m</span><span>45 m</span>
                </div>
              </div>
            </div>

            {recommended ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommended Model</p>
                    <h3 className="text-xl font-bold text-primary">{recommended.model}</h3>
                    <Badge className="mt-1 bg-accent/10 text-accent border-accent/20">{recommended.type}</Badge>
                  </div>
                  <Button
                    onClick={handleRequestQuote}
                    className="bg-accent hover:bg-accent/90 text-white font-semibold"
                    data-testid="calc-quote-btn"
                  >
                    Request Quote <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Crane Weight", value: recommended.weight },
                    { label: "Hoist Motor", value: recommended.motor },
                    { label: "Travel Speed", value: recommended.speed },
                  ].map((s) => (
                    <div key={s.label} className="bg-background rounded p-2">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-semibold text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
                No standard model for this combination. Please contact us for a custom design.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Crane specs table */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Standard Crane Range</h2>
          <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  {["Model", "Type", "Capacity", "Span Range", "Lift Height", "Crane Weight", "Motor", "Travel Speed"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRANE_MODELS.map((m, i) => (
                  <tr key={m.model} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"} data-testid={`crane-row-${m.model}`}>
                    <td className="px-4 py-3 font-semibold text-primary">{m.model}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.type}</td>
                    <td className="px-4 py-3 font-semibold">{m.capacity}T</td>
                    <td className="px-4 py-3">{m.span[0]}m – {m.span[1]}m</td>
                    <td className="px-4 py-3">{m.liftHeight[0]}m – {m.liftHeight[1]}m</td>
                    <td className="px-4 py-3">{m.weight}</td>
                    <td className="px-4 py-3">{m.motor}</td>
                    <td className="px-4 py-3">{m.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">* All cranes manufactured to IS:3177 standards. Custom configurations available on request.</p>
          <div className="mt-6">
            <Button onClick={() => setLocation("/contact?service=EOT+Crane")} className="bg-accent hover:bg-accent/90 text-white font-semibold">
              Request Technical Quotation <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
