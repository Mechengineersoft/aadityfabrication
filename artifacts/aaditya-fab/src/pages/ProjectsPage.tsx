import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Filter, ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProjects } from "@workspace/api-client-react";

const CATEGORIES = ["All", "EOT", "Shed", "Gantry", "Rework", "Fabrication"];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.title = "Project Gallery | EOT Crane & Shed Projects Bangalore | Aaditya Fabrication Works";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Portfolio of completed EOT crane installations, industrial shed fabrications, gantry crane projects, and rework jobs in Bangalore.");
  }, []);

  const { data: projects, isLoading } = useListProjects(
    activeCategory !== "All" ? { category: activeCategory } : {},
  );

  return (
    <div>
      {/* Header */}
      <section className="steel-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Project Gallery</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            A selection of completed projects across Bangalore's industrial sector — cranes, sheds, and rework.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Filter by:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "bg-card border border-border text-foreground hover:border-accent"
                }`}
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                  data-testid={`project-card-${p.id}`}
                >
                  {/* Before/After images */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {p.afterImage ? (
                      <img
                        src={p.afterImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-accent text-white border-0 text-xs">
                      {p.category}
                    </Badge>
                    {p.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white border-0 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.location ?? "Bangalore"}</span>
                      {p.year && <span>{p.year}</span>}
                    </div>
                    {p.specs && (
                      <p className="text-xs text-accent font-medium mt-2">{p.specs}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <PlusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 text-sm">Project photos will appear here once added from the admin panel.</p>
              <Link href="/contact">
                <Button className="bg-accent hover:bg-accent/90 text-white">
                  Enquire About Our Work <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
