"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, WifiOff, LinkIcon, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AppError } from "@/types";

interface ErrorCardProps {
  error: AppError;
  onRetry: () => void;
}

/** Maps error codes to icons */
function getErrorIcon(code?: string) {
  switch (code) {
    case "INVALID_URL":
      return <LinkIcon className="w-6 h-6" />;
    case "UNSUPPORTED":
      return <Ban className="w-6 h-6" />;
    case "NETWORK":
      return <WifiOff className="w-6 h-6" />;
    default:
      return <AlertTriangle className="w-6 h-6" />;
  }
}

export function ErrorCard({ error, onRetry }: ErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <Card className="border-destructive/20 bg-destructive/5 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Error Icon */}
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-destructive/10 text-destructive">
            {getErrorIcon(error.code)}
          </div>

          {/* Error Title */}
          <h3 className="font-semibold text-lg text-foreground">
            {error.title}
          </h3>

          {/* Error Message */}
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            {error.message}
          </p>

          {/* Retry Button */}
          <Button
            onClick={onRetry}
            variant="secondary"
            className="gap-2 mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
