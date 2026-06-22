/**
 * TypeScript interfaces for the Media Downloader application.
 * All types are defined here for single-source-of-truth consistency.
 */

/** Represents a single downloadable media format */
export interface MediaFormat {
  itag: string;
  qualityLabel: string;
  resolution: string;
  fps: number | null;
  vcodec: string;
  acodec: string;
  container: string;
  type: "video" | "audio";
  filesize: number | null;
  isRecommended?: boolean;
  height?: number;
  isAvailable?: boolean;
  mimeType: string;
  extension: string;
  filename: string;
}

/** Metadata returned from the /api/info endpoint */
export interface MediaInfo {
  type: "single" | "playlist";
  title: string;
  thumbnail: string;
  duration: number;
  author: string;
  viewCount: number;
  formats: MediaFormat[];
  url: string;
  platform: string;
}

/** Possible states for the main application flow */
export type AppState = "idle" | "loading" | "success" | "error" | "downloading";

/** Possible status labels for the progress indicator */
export type ProgressStatus = string;

/** Error information displayed in the error card */
export interface AppError {
  title: string;
  message: string;
  code?: string;
}
