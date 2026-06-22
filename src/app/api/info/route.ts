import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { resolveBinaries } from "@/utils/bin-resolver";

const execFileAsync = promisify(execFile);

/**
 * Validates that a URL is a well-formed HTTP(S) URL.
 * Does NOT restrict to YouTube — supports any yt-dlp compatible site.
 */
function isValidMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * POST /api/info
 * Accepts { url: string } and returns media metadata via yt-dlp.
 */
export async function POST(req: Request) {
  resolveBinaries();
  try {
    const body = await req.json().catch(() => null);
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 }
      );
    }

    if (!isValidMediaUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format. Please provide an HTTP or HTTPS URL." },
        { status: 400 }
      );
    }

    let stdout: string;
    try {
      const result = await execFileAsync(
        "yt-dlp",
        [
          "--dump-single-json",
          "--flat-playlist",
          "--no-warnings",
          "--no-check-certificates",
          url,
        ],
        {
          maxBuffer: 20 * 1024 * 1024,
          timeout: 30000,
        }
      );
      stdout = result.stdout;
    } catch (err: unknown) {
      const execErr = err as { code?: string; killed?: boolean };
      if (execErr.code === "ENOENT") {
        return NextResponse.json(
          { error: "yt-dlp is not installed on the server." },
          { status: 503 }
        );
      }
      if (execErr.killed || execErr.code === "ETIMEDOUT") {
        return NextResponse.json(
          { error: "Request timed out while analyzing the URL." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: "Failed to extract information from this URL." },
        { status: 500 }
      );
    }

    const info = JSON.parse(stdout);

    // Single video handling
    const title = info.title || "Unknown Title";
    const thumbnail = info.thumbnail || "";
    const duration = info.duration || 0;
    const author = info.uploader || info.channel || "Unknown";
    const viewCount = info.view_count || 0;

    const allFormats = info.formats || [];

    // Resolve platform
    const detectPlatform = (urlStr: string): string => {
      const lowercaseUrl = urlStr.toLowerCase();
      if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) return "youtube";
      if (lowercaseUrl.includes("instagram.com")) return "instagram";
      if (lowercaseUrl.includes("facebook.com") || lowercaseUrl.includes("fb.watch") || lowercaseUrl.includes("fb.com")) return "facebook";
      if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) return "twitter";
      if (lowercaseUrl.includes("tiktok.com")) return "tiktok";
      return "direct";
    };
    
    const platform = detectPlatform(url);

    // Clean title for naming - Convert to lowercase, remove / \ : * ? " < > |, and replace spaces with _
    const sanitizeTitle = (t: string): string => {
      let result = t.toLowerCase();
      result = result.replace(/[\/\\:\*\?"<>\|]/g, "");
      result = result.replace(/\s+/g, "_");
      result = result.replace(/_+/g, "_").trim();
      return result;
    };
    const cleanTitle = sanitizeTitle(title);

    // Helper to generate filename based on naming rule (no random UUIDs)
    const getFilename = (res: string, ext: string) => {
      const cleanRes = res.toLowerCase().replace(/\s+/g, "");
      if (platform === "direct") {
        return `${cleanTitle || "media"}_${cleanRes}.${ext}`;
      }
      return `${platform}_${cleanTitle || "media"}_${cleanRes}.${ext}`;
    };

    // Resolve max available height
    const videoHeights = allFormats
      .filter((f: Record<string, unknown>) => f.vcodec !== "none" && f.height)
      .map((f: Record<string, unknown>) => f.height as number);
    
    const maxWebHeight = info.height || 0;
    const maxHeight = Math.max(videoHeights.length > 0 ? Math.max(...videoHeights) : 0, maxWebHeight) || 720;

    // Helper to estimate video sizes
    const estimateVideoSize = (height: number, container: string) => {
      const matchingVideos = allFormats.filter(
        (f: Record<string, unknown>) => f.vcodec !== "none" && f.height === height
      );
      
      const bestAudio = allFormats
        .filter((f: Record<string, unknown>) => f.vcodec === "none" && f.acodec !== "none")
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.abr as number) || 0) - ((a.abr as number) || 0))[0];
      
      const aSize = bestAudio ? ((bestAudio.filesize as number) || (bestAudio.filesize_approx as number) || 0) : 0;

      if (matchingVideos.length > 0) {
        // Map container for lookup
        const lookupExt = container === "mov" ? "mp4" : container;
        const targetVideo = matchingVideos.find((f: Record<string, unknown>) => f.ext === lookupExt) || matchingVideos[0];
        const vSize = (targetVideo.filesize as number) || (targetVideo.filesize_approx as number) || 0;
        if (vSize > 0) {
          return vSize + aSize;
        }
      }

      // Fallback: estimate based on average bitrates
      const bitrates: Record<number, number> = {
        2160: 15000 * 1000,
        1440: 8000 * 1000,
        1080: 4500 * 1000,
        720: 2200 * 1000,
        480: 1000 * 1000,
        360: 500 * 1000,
      };
      const totalBitrate = (bitrates[height] || 1000 * 1000) + (128 * 1000);
      return duration ? Math.round((totalBitrate * duration) / 8) : null;
    };

    // Define target Video formats (MP4, WebM, MOV)
    const videoConfigs = [
      { itag: "mp4-2160", height: 2160, container: "mp4", qualityLabel: "2160p (4K)", resolution: "2160p", ext: "mp4", mime: "video/mp4" },
      { itag: "mp4-1440", height: 1440, container: "mp4", qualityLabel: "1440p", resolution: "1440p", ext: "mp4", mime: "video/mp4" },
      { itag: "mp4-1080", height: 1080, container: "mp4", qualityLabel: "1080p Full HD", resolution: "1080p", ext: "mp4", mime: "video/mp4" },
      { itag: "mp4-720", height: 720, container: "mp4", qualityLabel: "720p HD", resolution: "720p", ext: "mp4", mime: "video/mp4" },
      { itag: "mp4-480", height: 480, container: "mp4", qualityLabel: "480p", resolution: "480p", ext: "mp4", mime: "video/mp4" },
      { itag: "mp4-360", height: 360, container: "mp4", qualityLabel: "360p", resolution: "360p", ext: "mp4", mime: "video/mp4" },
      { itag: "webm-2160", height: 2160, container: "webm", qualityLabel: "2160p (4K)", resolution: "2160p", ext: "webm", mime: "video/webm" },
      { itag: "webm-1440", height: 1440, container: "webm", qualityLabel: "1440p", resolution: "1440p", ext: "webm", mime: "video/webm" },
      { itag: "webm-1080", height: 1080, container: "webm", qualityLabel: "1080p Full HD", resolution: "1080p", ext: "webm", mime: "video/webm" },
      { itag: "webm-720", height: 720, container: "webm", qualityLabel: "720p HD", resolution: "720p", ext: "webm", mime: "video/webm" },
      { itag: "webm-360", height: 360, container: "webm", qualityLabel: "360p", resolution: "360p", ext: "webm", mime: "video/webm" },
      { itag: "mov-1080", height: 1080, container: "mov", qualityLabel: "1080p Full HD", resolution: "1080p", ext: "mov", mime: "video/quicktime" },
      { itag: "mov-720", height: 720, container: "mov", qualityLabel: "720p HD", resolution: "720p", ext: "mov", mime: "video/quicktime" },
    ];

    const videoFormats = videoConfigs.map((config) => {
      const isAvailable = config.height <= maxHeight;
      const filesize = isAvailable ? estimateVideoSize(config.height, config.container) : null;
      return {
        itag: config.itag,
        qualityLabel: config.qualityLabel,
        resolution: config.resolution,
        fps: 30,
        vcodec: config.container === "webm" ? "vp9" : "h264",
        acodec: "aac",
        container: config.container,
        type: "video" as const,
        filesize,
        height: config.height,
        isAvailable,
        isRecommended: false,
        mimeType: config.mime,
        extension: config.ext,
        filename: getFilename(config.resolution, config.ext),
      };
    });

    // Set recommended video format (highest available up to 720p MP4, or fallback to any available)
    let recommendedVideo = videoFormats.find((f) => f.itag === "mp4-720" && f.isAvailable);
    if (!recommendedVideo) {
      recommendedVideo = videoFormats
        .filter((f) => f.container === "mp4" && f.isAvailable)
        .sort((a, b) => b.height - a.height)[0];
    }
    if (!recommendedVideo) {
      recommendedVideo = videoFormats.filter((f) => f.isAvailable)[0];
    }
    if (recommendedVideo) {
      recommendedVideo.isRecommended = true;
    }

    // Define target Audio formats
    const audioConfigs = [
      { itag: "mp3-320", qualityLabel: "MP3 320kbps", resolution: "320kbps", container: "mp3", bitrate: 320, ext: "mp3", mime: "audio/mpeg", isRecommended: false },
      { itag: "mp3-192", qualityLabel: "MP3 192kbps", resolution: "192kbps", container: "mp3", bitrate: 192, ext: "mp3", mime: "audio/mpeg", isRecommended: false },
      { itag: "mp3-128", qualityLabel: "MP3 128kbps", resolution: "128kbps", container: "mp3", bitrate: 128, ext: "mp3", mime: "audio/mpeg", isRecommended: true }, // Recommended default for Audio
      { itag: "mp3-64", qualityLabel: "MP3 64kbps", resolution: "64kbps", container: "mp3", bitrate: 64, ext: "mp3", mime: "audio/mpeg", isRecommended: false },
      { itag: "m4a-high", qualityLabel: "M4A High Quality", resolution: "High Quality", container: "m4a", bitrate: 128, ext: "m4a", mime: "audio/mp4", isRecommended: false },
    ];

    const audioFormats = audioConfigs.map((config) => {
      let filesize: number | null = null;
      if (duration > 0) {
        filesize = Math.round((config.bitrate * 1000 * duration) / 8);
      }
      return {
        itag: config.itag,
        qualityLabel: config.qualityLabel,
        resolution: config.resolution,
        fps: null,
        vcodec: "none",
        acodec: config.container === "mp3" ? "mp3" : "aac",
        container: config.container,
        type: "audio" as const,
        filesize,
        isAvailable: true,
        isRecommended: config.isRecommended,
        mimeType: config.mime,
        extension: config.ext,
        filename: getFilename(config.resolution, config.ext),
      };
    });

    const formats = [...videoFormats, ...audioFormats];

    return NextResponse.json({
      type: "single",
      title,
      thumbnail,
      duration,
      author,
      viewCount,
      formats,
      platform,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
