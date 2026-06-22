/**
 * URL validation and sanitization utilities.
 * Prevents XSS, invalid requests, and malformed URLs.
 */

import { MAX_URL_LENGTH } from "./constants";

/**
 * Checks if the given string is a structurally valid URL.
 * Rejects javascript:, data:, and other dangerous schemes.
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.length > MAX_URL_LENGTH) return false;

  try {
    const parsed = new URL(url);
    // Only allow http and https schemes
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    // Must have a hostname with at least one dot (basic domain check)
    if (!parsed.hostname.includes(".")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL string by trimming whitespace and
 * removing potentially dangerous characters.
 */
export function sanitizeUrl(url: string): string {
  return url
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .replace(/[<>"'`]/g, ""); // Strip HTML-dangerous chars
}

/**
 * Extracts the YouTube video ID from a URL.
 * Returns null if not a valid YouTube URL.
 */
export function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}
