import { Link } from "wouter";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Wrench className="w-16 h-16 text-accent mx-auto mb-4 opacity-60" />
        <h1 className="text-5xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The page you're looking for doesn't exist. Head back to the homepage or contact us for help.
        </p>
        <Link href="/">
          <Button className="bg-accent hover:bg-accent/90 text-white font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
