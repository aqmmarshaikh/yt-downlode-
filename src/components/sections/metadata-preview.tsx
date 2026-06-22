"use client";

import { motion } from "framer-motion";
import { Clock, User, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatViewCount, formatFilesize } from "@/utils/format-helpers";
import type { MediaInfo, MediaFormat } from "@/types";

interface MetadataPreviewProps {
  info: MediaInfo | null;
  isLoading: boolean;
  selectedFormat?: MediaFormat | null;
}

export function MetadataPreview({ info, isLoading, selectedFormat }: MetadataPreviewProps) {
  // Skeleton loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto px-4"
      >
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail skeleton */}
            <div className="w-full md:w-[300px] shrink-0 p-4">
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
            {/* Info skeleton */}
            <div className="flex-1 space-y-4 p-4 md:pl-0 pt-0 md:pt-4">
              <Skeleton className="h-7 w-3/4 rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full md:w-[300px] shrink-0 p-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden group bg-muted">
              {info.thumbnail ? (
                <img
                  src={info.thumbnail}
                  alt={info.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground/30">🎬</span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Duration badge */}
              {info.duration > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {formatDuration(info.duration)}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-4 md:pl-2 pt-0 md:pt-4 space-y-3">
            {/* Title */}
            <h3 className="font-bold text-lg sm:text-xl leading-tight line-clamp-2">
              {info.title}
            </h3>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {info.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground/80">{info.author}</span>
                </div>
              )}
              {info.viewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatViewCount(info.viewCount)} views</span>
                </div>
              )}
              {info.duration > 0 && (
                <div className="flex items-center gap-1.5 md:hidden">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(info.duration)}</span>
                </div>
              )}
            </div>

            {/* Technical Metadata Specs Panel (Universal Detection Display) */}
            {selectedFormat && (
              <div className="mt-4 pt-4 border-t border-border/65 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div className="col-span-2 flex flex-col gap-1 pb-1">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Filename</span>
                  <span className="text-foreground font-mono font-medium truncate bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/40 select-all" title={selectedFormat.filename}>
                    {selectedFormat.filename}
                  </span>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Format (Extension)</span>
                  <span className="text-foreground font-bold uppercase text-[13px]">{selectedFormat.extension}</span>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">MIME Type</span>
                  <span className="text-foreground font-mono text-[11px] font-medium">{selectedFormat.mimeType}</span>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Resolution</span>
                  <span className="text-foreground font-semibold text-[13px]">{selectedFormat.resolution}</span>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">File Size</span>
                  <span className="text-foreground font-semibold text-[13px]">
                    {selectedFormat.isAvailable ? (
                      selectedFormat.filesize ? formatFilesize(selectedFormat.filesize) : "--"
                    ) : (
                      <span className="text-destructive">Not Available</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
