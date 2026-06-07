import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import ProductsPage from "@/pages/ProductsPage";
import ProjectsPage from "@/pages/ProjectsPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminProjectsPage from "@/pages/AdminProjectsPage";
import AdminHeroImagesPage from "@/pages/AdminHeroImagesPage";
import AdminServicesPage from "@/pages/AdminServicesPage";
import AdminProductsPage from "@/pages/AdminProductsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

const ADMIN_ROUTES = ["/admin", "/admin/dashboard", "/admin/projects", "/admin/hero-images", "/admin/services", "/admin/products"];

function isAdminRoute(path: string) {
  return ADMIN_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

function Layout({ children }: { children: React.ReactNode }) {
  const path = window.location.pathname;
  const admin = isAdminRoute(path);
  return (
    <div className="min-h-screen flex flex-col">
      {!admin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!admin && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/projects" component={AdminProjectsPage} />
      <Route path="/admin/hero-images" component={AdminHeroImagesPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
