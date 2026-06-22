import { Shield, Lock } from "lucide-react";
import { APP_NAME, APP_VERSION } from "@/utils/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-md" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Privacy Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              Your URLs are never stored. All processing happens in your session.
            </span>
          </div>

          {/* Version */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              No tracking · No cookies · No ads
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>v{APP_VERSION}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              This tool is for personal use only. Respect content creators&apos; rights.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
