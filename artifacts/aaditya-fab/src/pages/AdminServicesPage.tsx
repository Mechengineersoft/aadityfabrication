import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, X, LogOut, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminSession,
  useListServices,
  useCreateService,
  useUpdateService,
  useAdminLogout,
  getListServicesQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import type { Service } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const ICONS = [
  { value: "crane", label: "Crane (Wrench)" },
  { value: "shed", label: "Shed (Building)" },
  { value: "fabrication", label: "Fabrication (Settings)" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const serviceSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  shortDescription: z.string().min(5, "Short description required"),
  fullDescription: z.string().min(10, "Full description required"),
  icon: z.string().min(1, "Icon required"),
  specs: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});
type ServiceForm = z.infer<typeof serviceSchema>;

async function deleteService(id: number) {
  const r = await fetch(`/api/services/${id}`, { method: "DELETE", credentials: "include" });
  if (!r.ok && r.status !== 204) throw new Error("Delete failed");
}

export default function AdminServicesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Manage Services | Admin | Aadity Fabrication Works";
  }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });
  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/admin");
  }, [session, sessionLoading, setLocation]);

  const { data: services, isLoading } = useListServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const logout = useAdminLogout();

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", slug: "", shortDescription: "", fullDescription: "", icon: "crane", specs: "", sortOrder: 0 },
  });

  const watchName = form.watch("name");
  useEffect(() => {
    if (!editingId && watchName) {
      form.setValue("slug", slugify(watchName), { shouldValidate: false });
    }
  }, [watchName, editingId]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", slug: "", shortDescription: "", fullDescription: "", icon: "crane", specs: "", sortOrder: (services?.length ?? 0) * 10 });
    setShowForm(true);
    setTimeout(() => document.getElementById("svc-name")?.focus(), 50);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    form.reset({
      name: s.name,
      slug: s.slug,
      shortDescription: s.shortDescription,
      fullDescription: s.fullDescription,
      icon: s.icon,
      specs: s.specs ?? "",
      sortOrder: s.sortOrder,
    });
    setShowForm(true);
    setTimeout(() => document.getElementById("svc-name")?.focus(), 50);
  };

  const onSubmit = (data: ServiceForm) => {
    const payload = {
      ...data,
      specs: data.specs || undefined,
    };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });

    if (editingId) {
      updateService.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { invalidate(); setShowForm(false); },
      });
    } else {
      createService.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setShowForm(false); },
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteService(id);
      queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
    } catch {
      alert("Failed to delete service.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { queryClient.clear(); setLocation("/admin"); },
    });
  };

  const isPending = createService.isPending || updateService.isPending;

  if (sessionLoading) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin nav */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">Dashboard</button>
          </Link>
          <Link href="/admin/projects">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">Projects</button>
          </Link>
          <Link href="/admin/hero-images">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">Hero Images</button>
          </Link>
          <span className="font-bold text-sm">Manage Services</span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-white h-7 text-xs">
          <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Services</h1>
            <p className="text-xs text-muted-foreground mt-0.5">These appear on the Services page of the website.</p>
          </div>
          <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white font-medium">
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-border mb-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Edit Service" : "Add New Service"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label htmlFor="svc-name" className="text-sm font-medium">Name *</Label>
                  <Input id="svc-name" className="mt-1" placeholder="e.g. EOT Cranes" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>

                {/* Slug */}
                <div>
                  <Label className="text-sm font-medium">Slug *</Label>
                  <Input className="mt-1" placeholder="eot-cranes" {...form.register("slug")} />
                  {form.formState.errors.slug && <p className="text-destructive text-xs mt-1">{form.formState.errors.slug.message}</p>}
                </div>

                {/* Short description */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Short Description * <span className="text-muted-foreground font-normal">(shown on homepage/cards)</span></Label>
                  <Input className="mt-1" placeholder="Brief one-liner for cards and previews" {...form.register("shortDescription")} />
                  {form.formState.errors.shortDescription && <p className="text-destructive text-xs mt-1">{form.formState.errors.shortDescription.message}</p>}
                </div>

                {/* Full description */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Full Description * <span className="text-muted-foreground font-normal">(shown on Services page)</span></Label>
                  <Textarea className="mt-1" rows={3} placeholder="Detailed description of this service…" {...form.register("fullDescription")} />
                  {form.formState.errors.fullDescription && <p className="text-destructive text-xs mt-1">{form.formState.errors.fullDescription.message}</p>}
                </div>

                {/* Icon */}
                <div>
                  <Label className="text-sm font-medium">Icon *</Label>
                  <Select value={form.watch("icon")} onValueChange={(v) => form.setValue("icon", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select icon…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map((ic) => (
                        <SelectItem key={ic.value} value={ic.value}>{ic.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.icon && <p className="text-destructive text-xs mt-1">{form.formState.errors.icon.message}</p>}
                </div>

                {/* Sort order */}
                <div>
                  <Label className="text-sm font-medium">Sort Order <span className="text-muted-foreground font-normal">(lower = first)</span></Label>
                  <Input className="mt-1" type="number" min={0} {...form.register("sortOrder")} />
                </div>

                {/* Specs */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Specs <span className="text-muted-foreground font-normal">(optional, comma-separated or line-by-line)</span></Label>
                  <Textarea className="mt-1" rows={2} placeholder="e.g. Capacity: 1T to 100T, Span: 5m to 50m" {...form.register("specs")} />
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" className="bg-accent hover:bg-accent/90 text-white font-medium" disabled={isPending}>
                    {isPending ? "Saving…" : editingId ? "Save Changes" : "Add Service"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Services list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm mb-3">No services yet. Add your first service to populate the Services page.</p>
            <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add First Service
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <Card key={svc.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{svc.name}</span>
                        <Badge variant="outline" className="text-xs">{svc.slug}</Badge>
                        <Badge variant="outline" className="text-xs">{svc.icon}</Badge>
                        <span className="text-xs text-muted-foreground">order: {svc.sortOrder}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{svc.shortDescription}</p>
                      {svc.specs && (
                        <p className="text-xs text-accent/80 mt-0.5 line-clamp-1">{svc.specs}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(svc)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(svc.id)}
                        disabled={deleting === svc.id}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
