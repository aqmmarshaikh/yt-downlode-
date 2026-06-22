/** Application-wide constants */

export const APP_NAME = "MediaDL";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Fast, clean and simple downloader experience.";

/** Maximum URL length to prevent abuse */
export const MAX_URL_LENGTH = 2048;

/** Debounce delay for submit button (ms) */
export const SUBMIT_DEBOUNCE_MS = 500;

/** Supported URL patterns for validation hints */
export const SUPPORTED_PATTERNS = [
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "instagram.com",
  "tiktok.com",
  "vimeo.com",
  "dailymotion.com",
  "soundcloud.com",
  "facebook.com",
  "reddit.com",
  "twitch.tv",
] as const;
