"use client";

import { motion } from "framer-motion";
import { Download, Link2, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-2xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Illustration */}
        <div className="relative">
          <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
            <Download className="w-10 h-10 text-primary/60" />
          </div>
          {/* Floating sparkle */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-secondary/50" />
          </motion.div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Ready to download
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Paste a media URL above to get started. We&apos;ll fetch the available formats
            and let you choose the best one.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md pt-4">
          {[
            { step: "1", icon: Link2, text: "Paste a URL" },
            { step: "2", icon: Sparkles, text: "Pick format" },
            { step: "3", icon: Download, text: "Download" },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                {item.step}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
