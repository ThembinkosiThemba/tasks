import { Button } from "@/components/ui/button";
import { Menu, Command, CheckSquare } from "lucide-react";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  onCommandOpen: () => void;
}

export function MobileHeader({ onMenuOpen, onCommandOpen }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 lg:hidden w-full border-b border-border/40 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight truncate">task</h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onCommandOpen}
        >
          <Command className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
