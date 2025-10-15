import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-dark/60">
      <div className="container flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Task Logo"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              task
            </h1>
          </div>
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void signOut()}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
