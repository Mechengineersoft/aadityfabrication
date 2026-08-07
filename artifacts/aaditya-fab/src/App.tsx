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


const WHATSAPP_NUMBER = "919019565420"; // +91-9019-565420

function WhatsAppFAB() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#1ebe5d] transition-colors"
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.5L4 29l7.75-1.813A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10S21.523 25 16 25c-1.98 0-3.82-.577-5.375-1.563l-.375-.25-4.594 1.063 1.094-4.469-.281-.406A9.96 9.96 0 0 1 6 15c0-5.523 4.477-10 10-10zm-3.188 5c-.175 0-.457.063-.7.313-.242.25-.937.906-.937 2.218 0 1.313.957 2.579 1.093 2.75.137.172 1.86 2.957 4.594 4.032 2.27.894 2.735.715 3.23.672.5-.043 1.602-.656 1.829-1.282.226-.625.226-1.16.156-1.281-.063-.125-.243-.188-.5-.313-.258-.125-1.602-.797-1.852-.89-.246-.094-.422-.141-.601.14-.176.282-.688.89-.844 1.063-.157.176-.313.195-.563.063-.25-.125-1.054-.39-2.011-1.25-.742-.668-1.242-1.492-1.39-1.743-.149-.25-.016-.387.11-.511.113-.114.258-.298.386-.445.13-.149.172-.254.258-.422.086-.172.043-.32-.016-.446-.063-.125-.59-1.43-.812-1.96-.215-.516-.433-.44-.594-.447-.152-.008-.329-.01-.504-.01z" />
      </svg>
    </a>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const path = window.location.pathname;
  const admin = isAdminRoute(path);
  return (
    <div className="min-h-screen flex flex-col">
      {!admin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!admin && <Footer />}
      {!admin && <WhatsAppFAB />}
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
