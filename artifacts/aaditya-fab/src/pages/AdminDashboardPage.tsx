import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Inbox, CheckCircle, Clock, BarChart2, LogOut, Download, Trash2,
  Search, ChevronDown, ChevronUp, RefreshCw, Plus, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminSession,
  useListInquiries,
  useGetInquiryStats,
  useUpdateInquiry,
  useDeleteInquiry,
  useAdminLogout,
  getListInquiriesQueryKey,
  getGetInquiryStatsQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import type { ListInquiriesStatus } from "@workspace/api-zod";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListInquiriesStatus>("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Aaditya Fabrication Works";
  }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      setLocation("/admin");
    }
  }, [session, sessionLoading, setLocation]);

  const params = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    service: serviceFilter !== "all" ? serviceFilter : undefined,
    search: search || undefined,
    page,
    limit: 15,
  };

  const { data: inquiryList, isLoading: inqLoading } = useListInquiries(params, {
    query: { queryKey: getListInquiriesQueryKey(params) },
  });

  const { data: stats } = useGetInquiryStats({
    query: { queryKey: getGetInquiryStatsQueryKey() },
  });

  const updateInquiry = useUpdateInquiry();
  const deleteInquiry = useDeleteInquiry();
  const logout = useAdminLogout();

  const handleToggleStatus = (id: number, current: string) => {
    updateInquiry.mutate(
      { id, data: { status: current === "read" ? "unread" : "read" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetInquiryStatsQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this inquiry?")) return;
    deleteInquiry.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetInquiryStatsQueryKey() });
        },
      },
    );
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      },
    });
  };

  const handleExport = () => {
    window.open("/api/inquiries/export", "_blank");
  };

  if (sessionLoading) {
    return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  }

  const inquiries = inquiryList?.data ?? [];
  const total = inquiryList?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin nav */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">Admin Dashboard</span>
          <Link href="/admin/projects">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">
              Projects
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">{session?.email}</span>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-white h-7 text-xs">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Inbox, label: "Total Inquiries", value: stats?.total ?? 0, color: "text-primary" },
            { icon: Clock, label: "Unread", value: stats?.unread ?? 0, color: "text-accent" },
            { icon: CheckCircle, label: "Last 7 Days", value: stats?.recentCount ?? 0, color: "text-emerald-600" },
            { icon: BarChart2, label: "Services Active", value: stats?.byService?.length ?? 0, color: "text-violet-600" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* By-service breakdown */}
        {stats?.byService && stats.byService.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Inquiries by Service</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stats.byService.map((s) => (
                <Badge key={s.service} variant="outline" className="text-xs">
                  {s.service}: {s.count}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Inquiries table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Inquiries ({total})</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExport} className="text-xs h-7">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() })}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-8 h-8 text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  data-testid="input-admin-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as ListInquiriesStatus); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {["EOT Crane", "Industrial Shed", "Shed Rework", "Crane Rework", "Gantry Crane", "General Fabrication"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {inqLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">No inquiries found.</div>
            ) : (
              <div className="divide-y divide-border">
                {inquiries.map((inq) => (
                  <div key={inq.id} className={`p-4 ${inq.status === "unread" ? "bg-accent/5" : ""}`} data-testid={`inquiry-row-${inq.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{inq.name}</span>
                          {inq.companyName && <span className="text-xs text-muted-foreground">({inq.companyName})</span>}
                          <Badge className={`text-xs ${inq.status === "unread" ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>
                            {inq.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{inq.service}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-3">
                          <span>{inq.phone}</span>
                          <span>{inq.email}</span>
                          <span>{new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        {inq.requiredCapacity && <span className="text-xs text-accent font-medium">{inq.requiredCapacity}T @ {inq.spanMeters}m span</span>}
                        {inq.shedDimensions && <span className="text-xs text-accent font-medium">Shed: {inq.shedDimensions}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                          title="Expand"
                        >
                          {expandedId === inq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          onClick={() => handleToggleStatus(inq.id, inq.status)}
                          title={inq.status === "unread" ? "Mark as Read" : "Mark as Unread"}
                        >
                          {inq.status === "unread" ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          onClick={() => handleDelete(inq.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {expandedId === inq.id && (
                      <div className="mt-3 pt-3 border-t border-border text-sm space-y-1 text-muted-foreground">
                        {inq.message && <p><span className="font-medium text-foreground">Message:</span> {inq.message}</p>}
                        {inq.existingEquipment && <p><span className="font-medium text-foreground">Equipment:</span> {inq.existingEquipment}</p>}
                        {inq.adminNotes && <p><span className="font-medium text-foreground">Notes:</span> {inq.adminNotes}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-7 text-xs">Prev</Button>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 text-xs">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
