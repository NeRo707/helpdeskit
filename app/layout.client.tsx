"use client";

import { Button } from "@/components/ui/button";
import { TUser } from "@/types/api";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LayoutClientProps {
  user: TUser | null;
  children: React.ReactNode;
}

export function LayoutClient({ user, children }: LayoutClientProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {!user && (
        <div className="p-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-3 text-muted-foreground cursor-pointer"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            {/* Protect ONLY the icons from mismatch */}
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" /> // Empty placeholder until mounted
            )}
            <span>
              {mounted
                ? resolvedTheme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"
                : "Loading..."}
            </span>
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
