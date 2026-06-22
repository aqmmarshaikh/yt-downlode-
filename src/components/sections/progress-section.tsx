"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import type { ProgressStatus } from "@/types";

interface ProgressSectionProps {
  progress: number;
  status: ProgressStatus;
  isComplete: boolean;
}

export function ProgressSection({ progress, status, isComplete }: ProgressSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <Card className="p-5 space-y-4">
        {/* Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            <span
              className={`text-sm font-medium ${
                isComplete ? "text-success" : "text-foreground"
              }`}
            >
              {status}
            </span>
          </div>
          <span className="text-sm font-mono font-semibold tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} showStripes={!isComplete} />

        {/* Completion message */}
        {isComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center pt-1"
          >
            Your download should start automatically.
          </motion.p>
        )}
      </Card>
    </motion.div>
  );
}
