import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminLogin, useGetAdminSession, getGetAdminSessionQueryKey } from "@workspace/api-client-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Admin Login | Aaditya Fabrication Works";
  }, []);

  const { data: session } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  useEffect(() => {
    if (session?.authenticated) setLocation("/admin/dashboard");
  }, [session, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useAdminLogin();

  const onSubmit = (data: FormValues) => {
    loginMutation.mutate(
      { data },
      { onSuccess: () => setLocation("/admin/dashboard") },
    );
  };

  return (
    <div className="min-h-screen steel-gradient flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-7 h-7 text-accent" />
            </div>
          </div>
          <CardTitle className="text-xl">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Aaditya Fabrication Works</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                autoComplete="email"
                data-testid="input-admin-email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                autoComplete="current-password"
                data-testid="input-admin-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {loginMutation.isError && (
              <p className="text-destructive text-sm text-center">Invalid email or password.</p>
            )}

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Default: admin@aadityafabrication.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
