import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, X, LogOut, Upload, ImageIcon } from "lucide-react";
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
  useListProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAdminLogout,
  getListProjectsQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const projectSchema = z.object({
  title: z.string().min(2, "Title required"),
  category: z.string().min(1, "Category required"),
  description: z.string().min(10, "Description required"),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  location: z.string().optional(),
  year: z.coerce.number().min(2000).max(2030).optional().or(z.literal("")),
  specs: z.string().optional(),
  featured: z.boolean().default(false),
});
type ProjectForm = z.infer<typeof projectSchema>;

const CATEGORIES = ["EOT", "Shed", "Gantry", "Rework", "Fabrication"];

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (res) => onChange(`/api/storage${res.objectPath}`),
  });

  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1 space-y-2">
        {/* Preview */}
        {value && (
          <div className="relative w-full h-28 bg-muted rounded-lg overflow-hidden border border-border">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {!value && (
          <div className="w-full h-28 bg-muted/40 rounded-lg border border-dashed border-border flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}

        {/* URL input */}
        <input
          type="text"
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Paste image URL…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Upload button */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-50 w-full justify-center"
        >
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? `Uploading… ${progress}%` : "Upload from device"}
        </button>
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Manage Projects | Admin | Aaditya Fabrication Works";
  }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({ query: { queryKey: getGetAdminSessionQueryKey(), retry: false } });
  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/admin");
  }, [session, sessionLoading, setLocation]);

  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const logout = useAdminLogout();

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", category: "", description: "", featured: false },
  });

  const openEdit = (p: NonNullable<typeof projects>[0]) => {
    setEditingId(p.id);
    form.reset({
      title: p.title,
      category: p.category,
      description: p.description,
      beforeImage: p.beforeImage ?? "",
      afterImage: p.afterImage ?? "",
      location: p.location ?? "",
      year: p.year ?? undefined,
      specs: p.specs ?? "",
      featured: p.featured,
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: "", category: "", description: "", featured: false });
    setShowForm(true);
  };

  const onSubmit = (data: ProjectForm) => {
    const payload = {
      ...data,
      year: data.year ? Number(data.year) : undefined,
      beforeImage: data.beforeImage || undefined,
      afterImage: data.afterImage || undefined,
      location: data.location || undefined,
      specs: data.specs || undefined,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      setShowForm(false);
    };

    if (editingId) {
      updateProject.mutate({ id: editingId, data: payload }, { onSuccess });
    } else {
      createProject.mutate({ data: payload }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this project?")) return;
    deleteProject.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }) });
  };

  const watchFeatured = form.watch("featured");
  const watchCategory = form.watch("category");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">Dashboard</button>
          </Link>
          <span className="font-bold text-sm">Manage Projects</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => logout.mutate(undefined, { onSuccess: () => { queryClient.clear(); setLocation("/admin"); } })} className="text-white/70 hover:text-white h-7 text-xs">
          <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Portfolio Projects</h1>
          <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white font-medium" data-testid="button-add-project">
            <Plus className="w-4 h-4 mr-1" /> Add Project
          </Button>
        </div>

        {/* Form panel */}
        {showForm && (
          <Card className="border-border mb-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Edit Project" : "Add New Project"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title *</Label>
                  <Input className="mt-1" data-testid="input-project-title" {...form.register("title")} />
                  {form.formState.errors.title && <p className="text-destructive text-xs mt-1">{form.formState.errors.title.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Category *</Label>
                  <Select value={watchCategory} onValueChange={(v) => form.setValue("category", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && <p className="text-destructive text-xs mt-1">{form.formState.errors.category.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description *</Label>
                  <Textarea className="mt-1" rows={3} {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-destructive text-xs mt-1">{form.formState.errors.description.message}</p>}
                </div>
                <ImageField
                  label="Before Image"
                  value={form.watch("beforeImage") ?? ""}
                  onChange={(url) => form.setValue("beforeImage", url)}
                />
                <ImageField
                  label="After Image"
                  value={form.watch("afterImage") ?? ""}
                  onChange={(url) => form.setValue("afterImage", url)}
                />
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Input className="mt-1" placeholder="e.g. Whitefield, Bangalore" {...form.register("location")} />
                </div>
                <div>
                  <Label className="text-sm font-medium">Year</Label>
                  <Input className="mt-1" type="number" min={2000} max={2030} {...form.register("year")} />
                </div>
                <div>
                  <Label className="text-sm font-medium">Specs</Label>
                  <Input className="mt-1" placeholder="e.g. 10T EOT, 18m span" {...form.register("specs")} />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={watchFeatured} onCheckedChange={(v) => form.setValue("featured", v)} id="featured" />
                  <Label htmlFor="featured" className="text-sm">Featured project</Label>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" className="bg-accent hover:bg-accent/90 text-white font-medium" disabled={createProject.isPending || updateProject.isPending}>
                    {editingId ? "Save Changes" : "Add Project"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Card key={p.id} className="border-border" data-testid={`project-admin-${p.id}`}>
                {p.afterImage && (
                  <img src={p.afterImage} alt={p.title} className="w-full h-36 object-cover rounded-t-lg" loading="lazy" />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        {p.featured && <Badge className="text-xs bg-accent text-white">Featured</Badge>}
                        {p.year && <Badge variant="outline" className="text-xs">{p.year}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                  {p.specs && <p className="text-xs text-accent font-medium mt-1">{p.specs}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm mb-3">No projects yet. Add your first project to populate the gallery.</p>
            <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
