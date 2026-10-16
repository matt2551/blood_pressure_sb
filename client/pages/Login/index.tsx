import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { useApi } from "@/hooks/useApi.js";
import { useAuth } from "@/lib/auth-context.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { run: loginApi, loading } = useApi("Login");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim() || !password) {
        toast.error("Please enter both username and password");
        return;
      }
      try {
        const result = await loginApi({ username: username.trim(), password });
        if (result?.success && result.user) {
          login(result.user);
          toast.success(`Welcome back, ${result.user.display_name}!`);
          navigate("/");
        } else {
          toast.error(result?.message || "Login failed");
        }
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Login error: " + message);
      }
    },
    [username, password, loginApi, login, navigate]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
            <Icon icon="heart-pulse" className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">BP Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to track your blood pressure
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/register"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
