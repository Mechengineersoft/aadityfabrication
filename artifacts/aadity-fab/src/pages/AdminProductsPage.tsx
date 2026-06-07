import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, X, LogOut, Upload, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useGetAdminSession,
  useAdminLogout,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const CATEGORIES = ["EOT Crane", "Gantry Crane", "Industrial Shed", "General Fabrication", "Other"];

const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  category: z.string().min(1, "Category required"),
  productType: z.string().optional(),
  description: z.string().optional(),
  specs: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});
type ProductForm = z.infer<typeof productSchema>;

export interface Product {
  id: number;
  name: string;
  category: string;
  productType: string;
  description: string;
  specs: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const QUERY_KEY = ["products-all"];

async function apiFetch(path: string, init?: RequestInit) {
  const r = await fetch(path, { credentials: "include", ...init });
  if (!r.ok && r.status !== 204) throw new Error(await r.text());
  return r;
}

function useProducts() {
  return useQuery<Product[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch("/api/products?all=1").then((r) => r.json()),
  });
}

function useCreateProduct() {
  return useMutation({
    mutationFn: (data: Partial<ProductForm>) =>
      apiFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  });
}

function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductForm> }) =>
      apiFetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  });
}

function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/products/${id}`, { method: "DELETE" }),
  });
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (res) => onChange(`/api/storage${res.objectPath}`),
  });

  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1 space-y-2">
        {value ? (
          <div className="relative w-full h-28 bg-muted rounded-lg overflow-hidden border border-border">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange("")} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full h-28 bg-muted/40 rounded-lg border border-dashed border-border flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        <input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Paste image URL…" value={value} onChange={(e) => onChange(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
        <button type="button" disabled={isUploading} onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-50 w-full justify-center">
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? `Uploading… ${progress}%` : "Upload from device"}
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { document.title = "Manage Products | Admin | Aadity Fabrication Works"; }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({ query: { queryKey: getGetAdminSessionQueryKey(), retry: false } });
  useEffect(() => { if (!sessionLoading && !session?.authenticated) setLocation("/admin"); }, [session, sessionLoading, setLocation]);

  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const logout = useAdminLogout();

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", category: "", productType: "", description: "", specs: "", imageUrl: "", active: true, sortOrder: 0 },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", category: "", productType: "", description: "", specs: "", imageUrl: "", active: true, sortOrder: (products?.length ?? 0) * 10 });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    form.reset({ name: p.name, category: p.category, productType: p.productType, description: p.description, specs: p.specs ?? "", imageUrl: p.imageUrl ?? "", active: p.active, sortOrder: p.sortOrder });
    setShowForm(true);
  };

  const onSubmit = (data: ProductForm) => {
    const payload = { ...data, specs: data.specs || undefined, imageUrl: data.imageUrl || undefined, productType: data.productType || undefined, description: data.description || undefined };
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    } else {
      createProduct.mutate(payload, { onSuccess: () => { invalidate(); setShowForm(false); } });
    }
  };

  const handleToggleActive = (p: Product) => {
    updateProduct.mutate({ id: p.id, data: { active: !p.active } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    deleteProduct.mutate(id, { onSuccess: invalidate });
  };

  const handleLogout = () => logout.mutate(undefined, { onSuccess: () => { queryClient.clear(); setLocation("/admin"); } });

  const watchActive = form.watch("active");
  const watchCategory = form.watch("category");
  const isPending = createProduct.isPending || updateProduct.isPending;

  if (sessionLoading) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;

  const activeCount = products?.filter((p) => p.active).length ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin nav */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard"><button className="text-xs text-white/70 hover:text-accent transition-colors">Dashboard</button></Link>
          <Link href="/admin/projects"><button className="text-xs text-white/70 hover:text-accent transition-colors">Projects</button></Link>
          <Link href="/admin/hero-images"><button className="text-xs text-white/70 hover:text-accent transition-colors">Hero Images</button></Link>
          <Link href="/admin/services"><button className="text-xs text-white/70 hover:text-accent transition-colors">Services</button></Link>
          <span className="font-bold text-sm">Manage Products</span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-white h-7 text-xs">
          <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">Products</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount > 0
                ? `${activeCount} active — shown on the Products page of the website.`
                : "No active products — website shows the default static catalogue."}
            </p>
          </div>
          <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white font-medium">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>

        {/* Info banner */}
        {activeCount === 0 && !isLoading && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <strong>No active products.</strong> Add products and mark them active — they will replace the default static content on the website's Products page.
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="border-border mb-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label className="text-sm font-medium">Product Name / Model *</Label>
                  <Input className="mt-1" placeholder="e.g. AFW-10T-SG" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium">Category *</Label>
                  <Select value={watchCategory} onValueChange={(v) => form.setValue("category", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  {form.formState.errors.category && <p className="text-destructive text-xs mt-1">{form.formState.errors.category.message}</p>}
                </div>

                {/* Product type */}
                <div>
                  <Label className="text-sm font-medium">Product Type</Label>
                  <Input className="mt-1" placeholder="e.g. Single Girder EOT" {...form.register("productType")} />
                </div>

                {/* Sort order */}
                <div>
                  <Label className="text-sm font-medium">Sort Order <span className="text-muted-foreground font-normal">(lower = first)</span></Label>
                  <Input className="mt-1" type="number" min={0} {...form.register("sortOrder")} />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea className="mt-1" rows={2} placeholder="Brief description of this product…" {...form.register("description")} />
                </div>

                {/* Specs */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">
                    Specifications <span className="text-muted-foreground font-normal">(one per line, e.g. "Capacity: 10 Tonnes")</span>
                  </Label>
                  <Textarea className="mt-1 font-mono text-sm" rows={6} placeholder={"Capacity: 10 Tonnes\nSpan Range: 6m – 20m\nLift Height: 3m – 12m\nCrane Weight: 2.8T\nHoist Motor: 5.5 kW x2\nTravel Speed: 16 m/min"} {...form.register("specs")} />
                </div>

                {/* Image */}
                <div className="md:col-span-2">
                  <ImageField label="Product Image (optional)" value={form.watch("imageUrl") ?? ""} onChange={(url) => form.setValue("imageUrl", url)} />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch checked={watchActive} onCheckedChange={(v) => form.setValue("active", v)} id="prod-active" />
                  <Label htmlFor="prod-active" className="text-sm">
                    {watchActive ? "Active — will appear on the website" : "Inactive — hidden from website"}
                  </Label>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" className="bg-accent hover:bg-accent/90 text-white font-medium" disabled={isPending}>
                    {isPending ? "Saving…" : editingId ? "Save Changes" : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products list */}
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm mb-3">No products yet. Add your first product to populate the Products page.</p>
            <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white"><Plus className="w-4 h-4 mr-1" /> Add First Product</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <Card key={p.id} className={`border-border transition-opacity ${p.active ? "" : "opacity-60"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Image thumb */}
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md shrink-0 border border-border" />
                    ) : (
                      <div className="w-16 h-16 bg-muted/40 rounded-md shrink-0 border border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{p.name}</span>
                        <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        {p.productType && <Badge variant="outline" className="text-xs">{p.productType}</Badge>}
                        <Badge className={`text-xs ${p.active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground"}`}>
                          {p.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                      {p.specs && (
                        <p className="text-xs text-accent/80 mt-0.5 line-clamp-1">{p.specs.split("\n")[0]}{p.specs.split("\n").length > 1 ? ` +${p.specs.split("\n").length - 1} more` : ""}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`p-1.5 rounded transition-colors ${p.active ? "text-emerald-600 hover:bg-emerald-50" : "text-muted-foreground hover:bg-muted"}`}
                        title={p.active ? "Click to deactivate" : "Click to activate"}
                      >
                        {p.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleteProduct.isPending} className="p-1.5 rounded hover:bg-destructive/10 transition-colors disabled:opacity-50" title="Delete">
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
