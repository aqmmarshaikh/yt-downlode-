"use client";

import { DownloadCloud } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME } from "@/utils/constants";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + App Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
            <DownloadCloud className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
