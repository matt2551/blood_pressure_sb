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

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { run: registerApi, loading } = useApi("Register");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim() || !displayName.trim() || !password) {
        toast.error("Please fill in all fields");
        return;
      }
      if (password.length < 4) {
        toast.error("Password must be at least 4 characters");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      try {
        const result = await registerApi({
          username: username.trim(),
          password,
          displayName: displayName.trim(),
        });
        if (result?.success && result.user) {
          login(result.user);
          toast.success("Account created! Welcome, " + result.user.display_name);
          navigate("/");
        } else {
          toast.error(result?.message || "Registration failed");
        }
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Registration error: " + message);
      }
    },
    [username, displayName, password, confirmPassword, registerApi, login, navigate]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
            <Icon icon="user-plus" className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Join your family's blood pressure tracker
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="e.g. Matt"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 4 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
