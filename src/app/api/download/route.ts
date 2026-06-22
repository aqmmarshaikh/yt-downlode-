import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { createReadStream, unlinkSync, statSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";
import { resolveBinaries } from "@/utils/bin-resolver";

const execFileAsync = promisify(execFile);

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

function withCors(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}


/**
 * Finds a temporary file matching the given prefix.
 * yt-dlp determines the final extension, so we search by prefix.
 */
function findTempFile(dir: string, prefix: string): string | null {
  try {
    const files = readdirSync(dir);
    const match = files.find((f) => f.startsWith(prefix));
    return match ? join(dir, match) : null;
  } catch {
    return null;
  }
}

/**
 * Safely removes a temp file, ignoring errors.
 */
function cleanupFile(path: string | null) {
  if (!path) return;
  try {
    unlinkSync(path);
  } catch {
    // Ignore cleanup failures
  }
}

/**
 * GET /api/download
 * Streams the downloaded file back to the client.
 * Query params: url, itag, type
 */
export async function GET(req: NextRequest) {
  resolveBinaries();
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "video";
  const itag = searchParams.get("itag");
  let filename = searchParams.get("filename");
  if (!filename) {
    const timestamp = Date.now();
    const ext = type === "audio" ? "mp3" : "mp4";
    filename = `${type === "audio" ? "audio" : "video"}_${timestamp}.${ext}`;
  }

  if (!url) {
    return withCors(new NextResponse("Invalid URL", { status: 400 }));
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return withCors(new NextResponse("Invalid URL scheme", { status: 400 }));
    }
  } catch {
    return withCors(new NextResponse("Malformed URL", { status: 400 }));
  }

  const safeFilename = filename.replace(/[^\w\s\.-]/g, "").trim() || `download.${type === "audio" ? "mp3" : "mp4"}`;
  const tempId = randomBytes(8).toString("hex");
  const tempDir = tmpdir();
  const tempPrefix = `mdl-${tempId}`;
  const tempTemplate = join(tempDir, `${tempPrefix}.%(ext)s`);

  try {
    const args: string[] = [];

    if (type === "audio") {
      if (itag && itag.startsWith("mp3-")) {
        // Specific MP3 bitrate
        const bitrate = itag.split("-")[1] + "K";
        args.push(
          "-x",
          "--audio-format", "mp3",
          "--audio-quality", bitrate,
          "-N", "5",
          "-o", tempTemplate,
          "--no-warnings",
          "--no-check-certificates",
          url
        );
      } else if (itag === "m4a-high") {
        // M4A High Quality (uses best native audio)
        args.push(
          "-f", "bestaudio[ext=m4a]/bestaudio",
          "-x",
          "--audio-format", "m4a",
          "-N", "5",
          "-o", tempTemplate,
          "--no-warnings",
          "--no-check-certificates",
          url
        );
      } else {
        // Fallback best audio
        args.push(
          "-x",
          "--audio-format", "mp3",
          "--audio-quality", "128K",
          "-N", "5",
          "-o", tempTemplate,
          "--no-warnings",
          "--no-check-certificates",
          url
        );
      }
    } else {
      // Video: parse resolution and container
      const parts = itag ? itag.split("-") : ["mp4", "720"];
      const container = parts[0] || "mp4";
      const height = parts[1] || "720";
      
      const formatStr = `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
      
      args.push(
        "-f", formatStr,
        "--merge-output-format", container,
        "-N", "5",
        "-o", tempTemplate,
        "--no-warnings",
        "--no-check-certificates",
        url
      );
    }

    await execFileAsync("yt-dlp", args, {
      timeout: 5 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const tempPath = findTempFile(tempDir, tempPrefix);
    if (!tempPath) {
      return withCors(new NextResponse("Download completed but file not found", {
        status: 500,
      }));
    }

    let fileSize: number;
    try {
      fileSize = statSync(tempPath).size;
    } catch {
      return withCors(new NextResponse("Download completed but file not found", {
        status: 500,
      }));
    }

    const actualExt =
      (tempPath.split(".").pop() || (type === "audio" ? "m4a" : "mp4")).toLowerCase();

    let contentType = "application/octet-stream";
    if (type === "audio") {
      if (actualExt === "mp3") {
        contentType = "audio/mpeg";
      } else if (actualExt === "m4a" || actualExt === "mp4") {
        contentType = "audio/mp4";
      } else if (actualExt === "webm") {
        contentType = "audio/webm";
      }
    } else {
      if (actualExt === "mp4") {
        contentType = "video/mp4";
      } else if (actualExt === "webm") {
        contentType = "video/webm";
      } else if (actualExt === "mov") {
        contentType = "video/quicktime";
      }
    }

    const nodeStream = createReadStream(tempPath);

    const stream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        nodeStream.on("end", () => {
          controller.close();
          cleanupFile(tempPath);
        });
        nodeStream.on("error", (err) => {
          controller.error(err);
          cleanupFile(tempPath);
        });
      },
      cancel() {
        nodeStream.destroy();
        cleanupFile(tempPath);
      },
    });

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", fileSize.toString());
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(stream, { headers });
  } catch (error: unknown) {
    // Cleanup on error
    const tempPath = findTempFile(tempDir, tempPrefix);
    cleanupFile(tempPath);

    const execErr = error as { code?: string; killed?: boolean };
    if (execErr.code === "ENOENT") {
      return withCors(new NextResponse("yt-dlp is not installed on the server", {
        status: 503,
      }));
    }
    if (execErr.killed) {
      return withCors(new NextResponse("Download timed out", { status: 504 }));
    }
    return withCors(new NextResponse("Failed to download", { status: 500 }));
  }
}
