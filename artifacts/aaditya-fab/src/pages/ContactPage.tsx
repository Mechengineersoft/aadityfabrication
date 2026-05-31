import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Clock, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateInquiry } from "@workspace/api-client-react";
import type { InquiryInput } from "@workspace/api-zod";

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().optional(),
  requiredCapacity: z.coerce.number().min(1).max(500).optional().or(z.literal("")),
  spanMeters: z.coerce.number().min(1).max(200).optional().or(z.literal("")),
  shedDimensions: z.string().optional(),
  existingEquipment: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

const SERVICES = [
  "EOT Crane",
  "Industrial Shed",
  "Shed Rework",
  "Crane Rework",
  "Gantry Crane",
  "General Fabrication",
];

const CRANE_SERVICES = ["EOT Crane", "Gantry Crane"];
const SHED_SERVICES = ["Industrial Shed"];
const REWORK_SERVICES = ["Shed Rework", "Crane Rework"];

export default function ContactPage() {
  const [location] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact & Request Quote | Aaditya Fabrication Works Bangalore";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Contact Aaditya Fabrication Works in Kallubalu, Bangalore. Request a free quote for EOT cranes, industrial sheds, gantry cranes, or fabrication work.");
  }, []);

  // Pre-fill from URL params
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const preService = params.get("service") ?? "";
  const preCapacity = params.get("capacity") ?? "";
  const preSpan = params.get("span") ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: "",
      companyName: "",
      phone: "",
      email: "",
      service: preService,
      message: "",
      requiredCapacity: preCapacity ? Number(preCapacity) : undefined,
      spanMeters: preSpan ? Number(preSpan) : undefined,
      shedDimensions: "",
      existingEquipment: "",
    },
  });

  const watchService = form.watch("service");
  const isCrane = CRANE_SERVICES.includes(watchService);
  const isShed = SHED_SERVICES.includes(watchService);
  const isRework = REWORK_SERVICES.includes(watchService);

  const createInquiry = useCreateInquiry();

  const onSubmit = (data: FormValues) => {
    const payload: InquiryInput = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      companyName: data.companyName || undefined,
      message: data.message || undefined,
      requiredCapacity: (isCrane && data.requiredCapacity) ? Number(data.requiredCapacity) : undefined,
      spanMeters: (isCrane && data.spanMeters) ? Number(data.spanMeters) : undefined,
      shedDimensions: (isShed && data.shedDimensions) ? data.shedDimensions : undefined,
      existingEquipment: (isRework && data.existingEquipment) ? data.existingEquipment : undefined,
    };

    createInquiry.mutate(
      { data: payload },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Enquiry Received</h2>
          <p className="text-muted-foreground">
            Thank you. We will respond within 24 hours with a detailed quote.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Business hours: Monday–Saturday, until 6:00 pm
          </p>
          <Button
            className="mt-6 bg-accent hover:bg-accent/90 text-white"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="steel-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Contact & Request Quote</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Tell us your requirements — we'll send a detailed technical quote within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Get in Touch</h2>
              {[
                { Icon: MapPin, label: "Address", value: "Beside Nandana Layout, Kallubalu, Bangalore" },
                { Icon: Phone, label: "Phone", value: "+91-XXXX-XXXXXX" },
                { Icon: Mail, label: "Email", value: "info@aadityafabrication.com" },
                { Icon: Clock, label: "Hours", value: "Monday–Saturday, Open until 6:00 pm" },
              ].map((c) => (
                <Card key={c.label} className="border-border">
                  <CardContent className="p-4 flex items-start gap-3">
                    <c.Icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</p>
                      <p className="text-sm font-medium mt-0.5">{c.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-accent mb-1">Quick Response Guarantee</p>
                <p className="text-xs text-muted-foreground">All enquiries receive a detailed technical quote within 24 business hours.</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input id="name" className="mt-1" data-testid="input-name" {...form.register("name")} />
                    {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                    <Input id="companyName" className="mt-1" data-testid="input-company" {...form.register("companyName")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone (10-digit) *</Label>
                    <Input id="phone" type="tel" maxLength={10} className="mt-1" data-testid="input-phone" {...form.register("phone")} />
                    {form.formState.errors.phone && <p className="text-destructive text-xs mt-1">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input id="email" type="email" className="mt-1" data-testid="input-email" {...form.register("email")} />
                    {form.formState.errors.email && <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Service Required *</Label>
                  <Select
                    value={watchService}
                    onValueChange={(v) => form.setValue("service", v)}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-service">
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.service && <p className="text-destructive text-xs mt-1">{form.formState.errors.service.message}</p>}
                </div>

                {/* Dynamic fields */}
                {isCrane && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border border-border">
                    <div>
                      <Label htmlFor="requiredCapacity" className="text-sm font-medium">Required Capacity (Tonnes)</Label>
                      <Input id="requiredCapacity" type="number" min={1} max={500} className="mt-1" data-testid="input-capacity" {...form.register("requiredCapacity")} />
                    </div>
                    <div>
                      <Label htmlFor="spanMeters" className="text-sm font-medium">Span (Metres)</Label>
                      <Input id="spanMeters" type="number" min={1} max={200} className="mt-1" data-testid="input-span" {...form.register("spanMeters")} />
                    </div>
                  </div>
                )}

                {isShed && (
                  <div className="p-4 bg-muted/40 rounded-lg border border-border">
                    <Label htmlFor="shedDimensions" className="text-sm font-medium">Shed Dimensions (L x W x H in metres)</Label>
                    <Input id="shedDimensions" placeholder="e.g. 30x15x8" className="mt-1" data-testid="input-dimensions" {...form.register("shedDimensions")} />
                    <p className="text-xs text-muted-foreground mt-1">Format: Length x Width x Height</p>
                  </div>
                )}

                {isRework && (
                  <div className="p-4 bg-muted/40 rounded-lg border border-border">
                    <Label htmlFor="existingEquipment" className="text-sm font-medium">Existing Equipment Make & Age</Label>
                    <Input id="existingEquipment" placeholder="e.g. Indef 10T crane, 15 years old" className="mt-1" data-testid="input-equipment" {...form.register("existingEquipment")} />
                  </div>
                )}

                <div>
                  <Label htmlFor="message" className="text-sm font-medium">Additional Details</Label>
                  <Textarea id="message" rows={4} className="mt-1" placeholder="Any additional requirements, site conditions, or specifications..." data-testid="input-message" {...form.register("message")} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                  disabled={createInquiry.isPending}
                  data-testid="button-submit"
                >
                  {createInquiry.isPending ? "Submitting..." : "Submit Enquiry"}
                </Button>

                {createInquiry.isError && (
                  <p className="text-destructive text-sm text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
