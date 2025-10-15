import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4 relative overflow-hidden dark">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Task Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              task
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Organize your work, amplify your productivity
            </p>
          </div>
        </div>

        {/* Login form card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                setError(error.message);
              });
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 bg-background/50 border border-border/50 rounded-md px-3 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-12 bg-background/50 border border-border/50 rounded-md px-3 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-3">
                <p className="text-sm text-red-200">Error: {error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-md font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              {flow === "signIn" ? "Sign in to task" : "Create account"}
            </button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                {flow === "signIn"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="text-sm text-primary underline hover:no-underline"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
