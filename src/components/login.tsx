import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex bg-dark dark">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background decorative elements for small screens */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
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
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoading(true);
                setError(null);
                const formData = new FormData(e.target as HTMLFormElement);
                formData.set("flow", flow);
                void signIn("password", formData)
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => {
                    setIsLoading(false);
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
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-md font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading
                  ? "Please wait..."
                  : flow === "signIn"
                    ? "Sign in to task"
                    : "Create account"}
              </button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {flow === "signIn"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </span>
                <button
                  type="button"
                  disabled={isLoading}
                  className="text-sm text-primary underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setFlow(flow === "signIn" ? "signUp" : "signIn");
                    setError(null);
                  }}
                >
                  {flow === "signIn" ? "Sign up" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Image with Gradients (Large screens only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark z-10" />

        {/* Decorative gradients */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />

        {/* Image */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src="/task.png"
            alt="Task Management"
            className="w-full h-full object-contain drop-shadow-2xl relative z-20 opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
