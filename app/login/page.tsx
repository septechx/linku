"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await authClient.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Failed to sign in");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  // Show nothing while checking auth to prevent flash
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-body text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Decorative frame */}
          <div className="absolute -inset-3 border border-gold/20"></div>
          <div className="absolute -inset-6 border border-border"></div>

          <div className="relative bg-card p-8 lg:p-10">
            {/* Section header */}
            <div className="text-center mb-8">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-gold">
                Authentication
              </span>
              <h2 className="mt-3 font-serif text-2xl text-foreground">Welcome Back</h2>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Enter your credentials to access your collection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="border-l-2 border-error bg-error-bg p-4">
                  <p className="font-body text-sm text-error">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="font-body border-border rounded-none focus:border-gold focus:ring-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="font-body border-border rounded-none focus:border-gold focus:ring-gold/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-foreground border-0 rounded-none h-12"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="h-px flex-1 bg-border"></div>
              <span className="font-body text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <p className="font-body text-sm text-muted-foreground">
                Not yet a member?{" "}
                <Link href="/register" className="text-gold hover-underline transition-luxury">
                  Subscribe now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
