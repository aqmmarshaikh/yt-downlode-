import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolveBinaries } from "@/utils/bin-resolver";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

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

interface SpawnResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
  error?: Error;
}

/**
 * Helper to run a process using child_process.spawn.
 * Collects stdout and stderr, enforces a timeout, and handles spawn/exec errors.
 */
function runSpawn(command: string, args: string[], timeoutMs: number = 30000): Promise<SpawnResult> {
  return new Promise((resolve) => {
    console.log(`[SPAWN LOG] Executing command: "${command} ${args.join(" ")}"`);
    
    let stdout = "";
    let stderr = "";
    let resolved = false;

    const child = spawn(command, args);

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error(`[SPAWN TIMEOUT] Process timed out after ${timeoutMs}ms. Terminating process...`);
        try {
          child.kill("SIGKILL");
        } catch (killErr) {
          console.error(`[SPAWN TIMEOUT] Failed to kill process:`, killErr);
        }
        resolve({
          stdout,
          stderr,
          code: null,
          signal: "SIGKILL",
          error: new Error(`Process timed out after ${timeoutMs}ms`)
        });
      }
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.error(`[SPAWN ERROR] Process event error for "${command}":`, error);
        resolve({ stdout, stderr, code: null, signal: null, error });
      }
    });

    child.on("close", (code, signal) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.log(`[SPAWN CLOSE] Process finished with exit code ${code}, signal ${signal}`);
        resolve({ stdout, stderr, code, signal });
      }
    });
  });
}

/**
 * POST /api/info
 * Accepts { url: string } and returns media metadata via yt-dlp.
 */
export async function POST(req: Request) {
  console.log(`[INFO API] Incoming POST request received.`);
  resolveBinaries();

  try {
    const body = await req.json().catch(() => null);
    const url = body?.url;
    console.log(`[INFO API] Parsed body url: "${url}"`);

    if (!url || typeof url !== "string") {
      console.warn(`[INFO API] Validation failed: A valid URL is required.`);
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isValidMediaUrl(url)) {
      console.warn(`[INFO API] Validation failed: Invalid URL format "${url}".`);
      return NextResponse.json(
        { error: "Invalid URL format. Please provide an HTTP or HTTPS URL." },
        { status: 400, headers: corsHeaders }
      );
    }

    let spawnResult: SpawnResult;
    let parsedInfo: any = null;

    // Attempt 1: Try with mweb Client (excellent bypass success on datacenter IPs)
    const mwebArgs = [
      "--extractor-args", "youtube:player_client=mweb",
      "--flat-playlist",
      "--no-warnings",
      "--no-check-certificates",
      "--geo-bypass",
      "--dump-single-json",
      url,
    ];
    console.log(`[INFO API] Attempt 1: Spawning yt-dlp with mweb client.`);
    spawnResult = await runSpawn("yt-dlp", mwebArgs, 35000);

    console.log(`[INFO API] Attempt 1 (mweb) stdout size: ${spawnResult.stdout.length} chars, stderr: "${spawnResult.stderr.trim()}"`);

    if (!spawnResult.error && spawnResult.code === 0 && spawnResult.stdout.trim().length > 0) {
      try {
        parsedInfo = JSON.parse(spawnResult.stdout);
      } catch (parseErr: any) {
        console.warn(`[INFO API] Attempt 1 (mweb) output JSON parse failed:`, parseErr.message);
      }
    }

    // Attempt 2: Try with Android Client
    if (!parsedInfo) {
      console.warn(`[INFO API] Attempt 1 (mweb) failed or returned invalid JSON. Falling back to Android client...`);
      const androidArgs = [
        "--extractor-args", "youtube:player_client=android",
        "--flat-playlist",
        "--no-warnings",
        "--no-check-certificates",
        "--geo-bypass",
        "--dump-single-json",
        url,
      ];
      console.log(`[INFO API] Attempt 2: Spawning yt-dlp with Android client.`);
      spawnResult = await runSpawn("yt-dlp", androidArgs, 35000);

      console.log(`[INFO API] Attempt 2 (android) stdout size: ${spawnResult.stdout.length} chars, stderr: "${spawnResult.stderr.trim()}"`);

      if (!spawnResult.error && spawnResult.code === 0 && spawnResult.stdout.trim().length > 0) {
        try {
          parsedInfo = JSON.parse(spawnResult.stdout);
        } catch (parseErr: any) {
          console.warn(`[INFO API] Attempt 2 (android) output JSON parse failed:`, parseErr.message);
        }
      }
    }

    // Attempt 3: Try with Web Client fallback
    if (!parsedInfo) {
      console.warn(`[INFO API] Attempt 2 (android) failed or returned invalid JSON. Falling back to Web client...`);
      const webArgs = [
        "--extractor-args", "youtube:player_client=web",
        "--flat-playlist",
        "--no-warnings",
        "--no-check-certificates",
        "--geo-bypass",
        "--dump-single-json",
        url,
      ];
      console.log(`[INFO API] Attempt 3: Spawning yt-dlp with Web client.`);
      spawnResult = await runSpawn("yt-dlp", webArgs, 35000);

      console.log(`[INFO API] Attempt 3 (web) stdout size: ${spawnResult.stdout.length} chars, stderr: "${spawnResult.stderr.trim()}"`);

      if (spawnResult.error) {
        console.error(`[INFO API] Fallback spawn error:`, spawnResult.error.message);
        throw spawnResult.error;
      }

      if (spawnResult.code !== 0) {
        console.error(`[INFO API] Fallback exited with non-zero code ${spawnResult.code}`);
        throw new Error(`yt-dlp failed to extract metadata. Stderr: ${spawnResult.stderr}`);
      }

      try {
        parsedInfo = JSON.parse(spawnResult.stdout);
      } catch (parseErr: any) {
        console.error(`[INFO API] Fallback output JSON parse failed:`, parseErr.message);
        throw new Error(`Failed to parse metadata from yt-dlp. Stderr: ${spawnResult.stderr}`);
      }
    }

    const info = parsedInfo;

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
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error(`[INFO API] HTTP 500 Uncaught Exception:`, error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
        stack: error.stack
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
