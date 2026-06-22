"use client";

import { motion } from "framer-motion";
import { User, GraduationCap, Heart } from "lucide-react";

export function AboutFounder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full mt-12"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        {/* Decorative subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-400" />
          Meet the Founder
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          {/* Founder Photo */}
          <div className="relative shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-md">
            <img
              src="/founder.jpg"
              alt="Ammar Shaikh — Founder of AnyMedia"
              className="w-full h-full object-cover grayscale-[10%] contrast-[105%] group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          {/* Founder Info Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Ammar Shaikh</h3>
              <p className="text-sm font-semibold text-indigo-400 mt-0.5">
                Founder & Developer of AnyMedia
              </p>
            </div>

            <div className="space-y-2.5 text-sm text-muted-foreground">
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <span>Student and Full Stack Developer</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Heart className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <span>Passionate about building useful internet tools.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
