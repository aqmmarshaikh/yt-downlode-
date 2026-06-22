"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Hero } from "@/components/sections/hero";
import { UrlInput } from "@/components/sections/url-input";
import { MetadataPreview } from "@/components/sections/metadata-preview";
import { DownloadOptions } from "@/components/sections/download-options";
import { ProgressSection } from "@/components/sections/progress-section";
import { ErrorCard } from "@/components/sections/error-card";
import { EmptyState } from "@/components/sections/empty-state";
import type { MediaInfo, AppState, AppError, ProgressStatus } from "@/types";

const getApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  }
  return "";
};

export default function Home() {

  // --- Application State (purely in-memory, session-scoped) ---
  const [appState, setAppState] = useState<AppState>("idle");
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [selectedItag, setSelectedItag] = useState<string>("");
  const [error, setError] = useState<AppError | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>("Preparing...");
  const [currentUrl, setCurrentUrl] = useState("");

  /** Fetches metadata from the API */
  const fetchMetadata = useCallback(async (url: string) => {
    setAppState("loading");
    setMediaInfo(null);
    setError(null);
    setProgress(0);
    setCurrentUrl(url);
    setProgressStatus("Fetching metadata...");

    try {
      const apiBase = getApiUrl();
      const res = await fetch(`${apiBase}/api/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMap: Record<number, { title: string; code: string }> = {
          400: { title: "Invalid URL", code: "INVALID_URL" },
          503: { title: "Service Unavailable", code: "SERVICE" },
          504: { title: "Request Timed Out", code: "TIMEOUT" },
        };
        const mapped = errorMap[res.status] || {
          title: "Request Failed",
          code: "UNKNOWN",
        };
        setError({
          title: mapped.title,
          message: data.error || "An unexpected error occurred.",
          code: mapped.code,
        });
        setAppState("error");
        return;
      }

      const info: MediaInfo = { ...data, url };
      setMediaInfo(info);

      // Selection rules:
      // 1. If MP4 exists and is available, select it automatically.
      // 2. Otherwise select WebM, or fallback to first available.
      const availableMp4 = info.formats.find(f => f.container === "mp4" && f.isAvailable && f.isRecommended) || 
                           info.formats.find(f => f.container === "mp4" && f.isAvailable);
      
      const availableWebm = info.formats.find(f => f.container === "webm" && f.isAvailable && f.isRecommended) ||
                             info.formats.find(f => f.container === "webm" && f.isAvailable);

      if (availableMp4) {
        setSelectedItag(availableMp4.itag);
      } else if (availableWebm) {
        setSelectedItag(availableWebm.itag);
      } else if (info.formats.length > 0) {
        setSelectedItag(info.formats[0].itag);
      }

      setAppState("success");
    } catch {
      setError({
        title: "Network Error",
        message:
          "Could not connect to the server. Please check your connection and try again.",
        code: "NETWORK",
      });
      setAppState("error");
    }
  }, []);

  /** Initiates the download */
  const handleDownload = useCallback(async () => {
    if (!mediaInfo || !selectedItag) return;

    const selectedFormat = mediaInfo.formats.find(
      (f) => f.itag === selectedItag
    );
    if (!selectedFormat) return;

    setAppState("downloading");
    setProgress(0);
    setProgressStatus("Preparing media...");

    // Print details before download
    console.log("Selected Format:", selectedFormat);
    console.log("Filename:", selectedFormat.filename);
    console.log("Extension:", selectedFormat.extension);
    console.log("MIME:", selectedFormat.mimeType);

    try {
      const urlFilename =
        selectedFormat.filename ||
        `video_${Date.now()}.${selectedFormat.extension || "mp4"}`;

      const apiBase = getApiUrl();
      const downloadUrl = `${apiBase}/api/download?url=${encodeURIComponent(
        mediaInfo.url
      )}&itag=${encodeURIComponent(selectedItag)}&type=${selectedFormat.type}&filename=${encodeURIComponent(urlFilename)}`;

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Download failed");
        let displayError = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.error) {
            displayError = parsed.error;
          }
        } catch {}
        throw new Error(displayError);
      }

      setProgressStatus("Downloading...");

      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get("Content-Length") || 0);

      if (!reader) throw new Error("Stream not available");

      let receivedLength = 0;
      const chunks: BlobPart[] = [];

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.byteLength;

        if (contentLength) {
          setProgress((receivedLength / contentLength) * 100);
        } else {
          // Estimate progress when content length is unknown
          setProgress((prev) => Math.min(prev + (100 - prev) * 0.03, 95));
        }
      }

      setProgressStatus("Saving...");

      const blob = new Blob(chunks, {
        type: selectedFormat.mimeType || "video/mp4"
      });

      const blobUrl = URL.createObjectURL(blob);

      const filename =
        selectedFormat.filename ||
        `video_${Date.now()}.${selectedFormat.extension || "mp4"}`;

      const a = document.createElement("a");
      a.href = blobUrl;
      a.setAttribute("download", filename);
      a.style.display = "none";

      document.body.appendChild(a);

      requestAnimationFrame(() => {
        a.click();

        // Verify after clicking
        console.log({
          download: a.download,
          href: a.href,
          filename,
          mimeType: blob.type
        });

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 10000);
      });

      setProgress(100);
      setProgressStatus("Ready");
      
      // Return to success state after a brief delay
      setTimeout(() => {
        setAppState("success");
      }, 1500);

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Download failed";
      setError({
        title: "Download Failed",
        message,
        code: "DOWNLOAD",
      });
      setAppState("error");
    }
  }, [mediaInfo, selectedItag]);

  /** Clears everything and resets to idle */
  const handleClear = useCallback(() => {
    setAppState("idle");
    setMediaInfo(null);
    setSelectedItag("");
    setError(null);
    setProgress(0);
    setCurrentUrl("");
  }, []);

  /** Retries the last request */
  const handleRetry = useCallback(() => {
    if (currentUrl) {
      fetchMetadata(currentUrl);
    } else {
      handleClear();
    }
  }, [currentUrl, fetchMetadata, handleClear]);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="flex flex-col gap-8 pb-20 -mt-8">
        {/* URL Input — always visible */}
        <UrlInput
          onSubmit={fetchMetadata}
          isLoading={appState === "loading"}
          onClear={handleClear}
        />

        <AnimatePresence mode="wait">
          {/* Loading State — Skeleton */}
          {appState === "loading" && (
            <MetadataPreview key="skeleton" info={null} isLoading={true} />
          )}

          {/* Error State */}
          {appState === "error" && error && (
            <ErrorCard key="error" error={error} onRetry={handleRetry} />
          )}

          {/* Success State — Show metadata + download options */}
          {(appState === "success" || appState === "downloading") &&
            mediaInfo && (
              <div key="results" className="flex flex-col gap-8">
                <MetadataPreview 
                  info={mediaInfo} 
                  isLoading={false} 
                  selectedFormat={mediaInfo.formats.find(f => f.itag === selectedItag) || null}
                />
                <DownloadOptions
                  formats={mediaInfo.formats}
                  selectedItag={selectedItag}
                  onSelectFormat={setSelectedItag}
                  onDownload={handleDownload}
                  isDownloading={appState === "downloading"}
                />
              </div>
            )}

          {/* Downloading Progress */}
          {appState === "downloading" && (
            <ProgressSection
              key="progress"
              progress={progress}
              status={progressStatus}
              isComplete={progress >= 100}
            />
          )}

          {/* Idle State — Empty */}
          {appState === "idle" && <EmptyState key="empty" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
