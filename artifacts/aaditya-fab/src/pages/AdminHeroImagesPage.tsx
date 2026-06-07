import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, Trash2, Upload, ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff, LayoutDashboard, FolderOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useGetAdminSession, useAdminLogout, getGetAdminSessionQueryKey } from "@workspace/api-client-react";

interface HeroImage {
  id: number;
  url: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

function customFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

function useHeroImages() {
  return useQuery<HeroImage[]>({
    queryKey: ["hero-images-all"],
    queryFn: () => customFetch("/api/hero-images/all").then((r) => r.json()),
  });
}

function ImageUploadField({ onAdd }: { onAdd: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (res) => {
      onAdd(`/api/storage${res.objectPath}`);
    },
  });

  return (
    <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Add new hero image</p>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Paste image URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={!url.trim()}
          onClick={() => { if (url.trim()) { onAdd(url.trim()); setUrl(""); } }}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

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
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-50 w-full justify-center"
      >
        <Upload className="w-3.5 h-3.5" />
        {isUploading ? `Uploading… ${progress}%` : "Upload from device"}
      </button>
    </div>
  );
}

export default function AdminHeroImagesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });
  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/admin");
  }, [session, sessionLoading, setLocation]);

  const logout = useAdminLogout();

  const { data: imagesRaw, isLoading } = useHeroImages();
  const images = Array.isArray(imagesRaw) ? imagesRaw : [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["hero-images-all"] });
    queryClient.invalidateQueries({ queryKey: ["hero-images"] });
  };

  const addImage = useMutation({
    mutationFn: async (url: string) => {
      const r = await customFetch("/api/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, displayOrder: images.length, active: true }),
      });
      if (!r.ok) throw new Error(`Failed to save image (${r.status})`);
      return r.json();
    },
    onSuccess: invalidateAll,
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, ...data }: Partial<HeroImage> & { id: number }) => {
      const r = await customFetch(`/api/hero-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(`Failed to update image (${r.status})`);
      return r.json();
    },
    onSuccess: invalidateAll,
  });

  const deleteImage = useMutation({
    mutationFn: async (id: number) => {
      const r = await customFetch(`/api/hero-images/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Failed to delete image (${r.status})`);
    },
    onSuccess: invalidateAll,
  });

  const move = (img: HeroImage, dir: -1 | 1) => {
    const sorted = [...(images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((i) => i.id === img.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    updateImage.mutate({ id: img.id, displayOrder: other.displayOrder });
    updateImage.mutate({ id: other.id, displayOrder: img.displayOrder });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-accent" />
          <div>
            <h1 className="font-bold text-base leading-tight">Hero Images</h1>
            <p className="text-xs text-muted-foreground">Manage homepage slideshow</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Button>
          </Link>
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <FolderOpen className="w-3.5 h-3.5" /> Projects
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => logout.mutate(undefined, { onSuccess: () => { queryClient.clear(); setLocation("/admin"); } })}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <ImageUploadField onAdd={(url) => addImage.mutate(url)} />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hero images yet. Add one above — the default dark background will show until images are added.
          </div>
        ) : (
          <div className="space-y-3">
            {[...images].sort((a, b) => a.displayOrder - b.displayOrder).map((img, idx, arr) => (
              <Card key={img.id} className={`border-border ${!img.active ? "opacity-60" : ""}`}>
                <CardContent className="p-3 flex gap-3 items-center">
                  <div className="w-24 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
                    {img.url ? (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{img.url}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                      {img.active
                        ? <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Visible</Badge>
                        : <Badge variant="outline" className="text-xs text-muted-foreground">Hidden</Badge>
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => move(img, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(img, 1)}
                      disabled={idx === arr.length - 1}
                      className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateImage.mutate({ id: img.id, active: !img.active })}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title={img.active ? "Hide" : "Show"}
                    >
                      {img.active
                        ? <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this image?")) deleteImage.mutate(img.id); }}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
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
