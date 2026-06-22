"use client";

import { motion } from "framer-motion";
import { Video, Music, Star, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFilesize } from "@/utils/format-helpers";
import { cn } from "@/lib/utils";
import type { MediaFormat } from "@/types";

interface DownloadOptionsProps {
  formats: MediaFormat[];
  selectedItag: string;
  onSelectFormat: (itag: string) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export function DownloadOptions({
  formats,
  selectedItag,
  onSelectFormat,
  onDownload,
  isDownloading,
}: DownloadOptionsProps) {
  const videoFormats = formats.filter((f) => f.type === "video");
  const audioFormats = formats.filter((f) => f.type === "audio");

  const hasMp4 = videoFormats.some((f) => f.container === "mp4" && f.isAvailable !== false);
  const hasWebm = videoFormats.some((f) => f.container === "webm" && f.isAvailable !== false);
  const onlyWebm = hasWebm && !hasMp4;

  if (formats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-3xl mx-auto px-4 space-y-6"
    >
      {onlyWebm && (
        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-md shadow-amber-500/5">
          <span className="text-base select-none">⚠️</span>
          <span>Only WebM format is available.</span>
        </div>
      )}

      {/* Video Formats */}
      {videoFormats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90 px-1">
            <Video className="w-4 h-4 text-primary" />
            Video Formats
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videoFormats.map((format, index) => (
              <FormatCard
                key={format.itag}
                format={format}
                isSelected={selectedItag === format.itag}
                onSelect={() => onSelectFormat(format.itag)}
                isDisabled={isDownloading}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio Formats */}
      {audioFormats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90 px-1">
            <Music className="w-4 h-4 text-secondary" />
            Audio Formats
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {audioFormats.map((format, index) => (
              <FormatCard
                key={format.itag}
                format={format}
                isSelected={selectedItag === format.itag}
                onSelect={() => onSelectFormat(format.itag)}
                isDisabled={isDownloading}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      )}

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onDownload}
          disabled={isDownloading || !selectedItag}
          className="w-full h-14 text-base font-semibold gap-2 rounded-xl"
          size="lg"
        >
          <Download className="w-5 h-5 animate-pulse" />
          {isDownloading ? "Processing..." : "Download Now"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ---- Individual Format Card ---- */
interface FormatCardProps {
  format: MediaFormat;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled: boolean;
  delay: number;
}

function FormatCard({ format, isSelected, onSelect, isDisabled, delay }: FormatCardProps) {
  const isAvailable = format.isAvailable !== false;
  const cardDisabled = isDisabled || !isAvailable;

  // Resolve quality badge details
  let badgeText = "";
  let badgeClass = "";
  if (format.type === "audio") {
    badgeText = "Audio";
    badgeClass = "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  } else if (format.height === 1080) {
    badgeText = "Full HD";
    badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  } else if (format.height === 720) {
    badgeText = "HD";
    badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: cardDisabled ? 1 : 1.02 }}
      whileTap={{ scale: cardDisabled ? 1 : 0.98 }}
      onClick={onSelect}
      disabled={cardDisabled}
      aria-label={`Select ${format.qualityLabel} ${format.type} format`}
      aria-pressed={isSelected}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden min-h-[90px] w-full",
        isSelected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
          : isAvailable
          ? "border-border bg-card hover:bg-muted/50 hover:border-border/30 hover:shadow-sm cursor-pointer"
          : "border-border/50 bg-card/40 opacity-40 cursor-not-allowed",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Recommended Badge */}
      {format.isRecommended && isAvailable && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5">
          <Star className="w-2 h-2 fill-current" />
          Best
        </div>
      )}

      {/* Quality Label & Badge */}
      <div className="flex items-center justify-between w-full mb-1">
        <span
          className={cn(
            "font-bold text-sm sm:text-base",
            isSelected ? "text-primary" : "text-foreground"
          )}
        >
          {format.qualityLabel}
        </span>
        {badgeText && isAvailable && (
          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md", badgeClass)}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Format Details */}
      <div className="flex items-center justify-between w-full text-xs text-muted-foreground font-medium mt-auto">
        <span className="uppercase">
          {format.container}
        </span>
        <span>
          {isAvailable ? (
            format.filesize ? formatFilesize(format.filesize) : "--"
          ) : (
            <span className="text-destructive font-semibold">Not Available</span>
          )}
        </span>
      </div>
    </motion.button>
  );
}
