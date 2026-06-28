import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { createReadStream, unlinkSync, statSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";
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

interface SpawnResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
  error?: Error;
}

/**
 * Helper to run a process using child_process.spawn.
 */
function runSpawn(command: string, args: string[], timeoutMs: number = 5 * 60 * 1000): Promise<SpawnResult> {
  return new Promise((resolve) => {
    console.log(`[SPAWN DOWNLOAD] Executing command: "${command} ${args.join(" ")}"`);
    
    let stdout = "";
    let stderr = "";
    let resolved = false;

    const child = spawn(command, args);

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error(`[SPAWN DOWNLOAD TIMEOUT] Download timed out after ${timeoutMs}ms. Terminating...`);
        try {
          child.kill("SIGKILL");
        } catch (killErr) {
          console.error(`[SPAWN DOWNLOAD TIMEOUT] Failed to kill process:`, killErr);
        }
        resolve({
          stdout,
          stderr,
          code: null,
          signal: "SIGKILL",
          error: new Error(`Download timed out after ${timeoutMs}ms`)
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
        console.error(`[SPAWN DOWNLOAD ERROR] Process error:`, error);
        resolve({ stdout, stderr, code: null, signal: null, error });
      }
    });

    child.on("close", (code, signal) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.log(`[SPAWN DOWNLOAD CLOSE] Process finished with exit code ${code}, signal ${signal}`);
        resolve({ stdout, stderr, code, signal });
      }
    });
  });
}

/**
 * GET /api/download
 * Streams the downloaded file back to the client.
 * Query params: url, itag, type
 */
export async function GET(req: NextRequest) {
  console.log(`[DOWNLOAD API] Incoming GET request received.`);
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
    console.warn(`[DOWNLOAD API] Missing URL parameter.`);
    return withCors(NextResponse.json({ error: "Invalid URL: URL parameter is required." }, { status: 400 }));
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.warn(`[DOWNLOAD API] Invalid URL scheme: "${parsed.protocol}"`);
      return withCors(NextResponse.json({ error: "Invalid URL: HTTP or HTTPS protocol required." }, { status: 400 }));
    }
  } catch {
    console.warn(`[DOWNLOAD API] Malformed URL: "${url}"`);
    return withCors(NextResponse.json({ error: "Invalid URL format." }, { status: 400 }));
  }

  const safeFilename = filename.replace(/[^\w\s\.-]/g, "").trim() || `download.${type === "audio" ? "mp3" : "mp4"}`;
  const tempId = randomBytes(8).toString("hex");
  const tempDir = tmpdir();
  const tempPrefix = `mdl-${tempId}`;
  const tempTemplate = join(tempDir, `${tempPrefix}.%(ext)s`);

  let tempPath: string | null = null;

  try {
    const buildArgs = (clientType: "tv" | "mweb" | "android" | "web") => {
      const args: string[] = [
        "--extractor-args", `youtube:player_client=${clientType}`,
        "--geo-bypass",
        "--no-warnings",
        "--no-check-certificates"
      ];

      if (type === "audio") {
        if (itag && itag.startsWith("mp3-")) {
          // Specific MP3 bitrate
          const bitrate = itag.split("-")[1] + "K";
          args.push(
            "-f", "bestaudio/best",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", bitrate,
            "-N", "5",
            "-o", tempTemplate,
            url
          );
        } else if (itag === "m4a-high") {
          // M4A High Quality (uses best native audio)
          args.push(
            "-f", "bestaudio[ext=m4a]/bestaudio/best",
            "-x",
            "--audio-format", "m4a",
            "-N", "5",
            "-o", tempTemplate,
            url
          );
        } else {
          // Fallback best audio
          args.push(
            "-f", "bestaudio/best",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "128K",
            "-N", "5",
            "-o", tempTemplate,
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
          url
        );
      }
      return args;
    };

    // Attempt 1: Try with tv player (excellent bypass on datacenter IP blocks)
    let currentArgs = buildArgs("tv");
    console.log(`[DOWNLOAD API] Attempt 1: Spawning yt-dlp with tv client.`);
    let spawnResult = await runSpawn("yt-dlp", currentArgs, 5 * 60 * 1000);

    tempPath = findTempFile(tempDir, tempPrefix);

    // Check if Attempt 1 failed
    if (spawnResult.error || spawnResult.code !== 0 || !tempPath) {
      console.warn(`[DOWNLOAD API] Attempt 1 (tv) failed (code: ${spawnResult.code}, error: ${spawnResult.error?.message}). Cleaning up and retrying with mweb client...`);
      cleanupFile(tempPath);
      tempPath = null;

      // Attempt 2: Try with mweb player
      currentArgs = buildArgs("mweb");
      console.log(`[DOWNLOAD API] Attempt 2: Spawning yt-dlp with mweb client.`);
      spawnResult = await runSpawn("yt-dlp", currentArgs, 5 * 60 * 1000);
      tempPath = findTempFile(tempDir, tempPrefix);
    }

    // Check if Attempt 2 failed
    if (spawnResult.error || spawnResult.code !== 0 || !tempPath) {
      console.warn(`[DOWNLOAD API] Attempt 2 (mweb) failed (code: ${spawnResult.code}, error: ${spawnResult.error?.message}). Cleaning up and retrying with Android client...`);
      cleanupFile(tempPath);
      tempPath = null;

      // Attempt 3: Try with Android player
      currentArgs = buildArgs("android");
      console.log(`[DOWNLOAD API] Attempt 3: Spawning yt-dlp with Android client.`);
      spawnResult = await runSpawn("yt-dlp", currentArgs, 5 * 60 * 1000);
      tempPath = findTempFile(tempDir, tempPrefix);
    }

    // Check if Attempt 3 failed
    if (spawnResult.error || spawnResult.code !== 0 || !tempPath) {
      console.warn(`[DOWNLOAD API] Attempt 3 (android) failed (code: ${spawnResult.code}, error: ${spawnResult.error?.message}). Cleaning up and retrying with Web client...`);
      cleanupFile(tempPath);
      tempPath = null;

      // Attempt 4: Try fallback with Web player
      currentArgs = buildArgs("web");
      console.log(`[DOWNLOAD API] Attempt 4: Spawning yt-dlp with Web client.`);
      spawnResult = await runSpawn("yt-dlp", currentArgs, 5 * 60 * 1000);
      tempPath = findTempFile(tempDir, tempPrefix);
    }

    if (spawnResult.error) {
      cleanupFile(tempPath);
      console.error(`[DOWNLOAD API] Final download failed with spawn error:`, spawnResult.error.message);
      const errCode = (spawnResult.error as any).code;
      if (errCode === "ENOENT") {
        return withCors(NextResponse.json({ error: "yt-dlp is not installed on the server." }, { status: 503 }));
      }
      return withCors(NextResponse.json({ error: spawnResult.error.message }, { status: 500 }));
    }

    if (spawnResult.code !== 0) {
      cleanupFile(tempPath);
      console.error(`[DOWNLOAD API] Final download failed with exit code: ${spawnResult.code}. Stderr: ${spawnResult.stderr}`);
      if (spawnResult.code === null && spawnResult.signal === "SIGKILL") {
        return withCors(NextResponse.json({ error: "Download request timed out." }, { status: 504 }));
      }
      return withCors(NextResponse.json({ error: `yt-dlp failed to download media. Stderr: ${spawnResult.stderr}` }, { status: 500 }));
    }

    if (!tempPath) {
      console.error(`[DOWNLOAD API] Final download exited 0 but temp file was not found.`);
      return withCors(NextResponse.json({ error: "Download completed but the file was not found on the server." }, { status: 500 }));
    }

    let fileSize: number;
    try {
      fileSize = statSync(tempPath).size;
    } catch {
      cleanupFile(tempPath);
      return withCors(NextResponse.json({ error: "Failed to read downloaded file statistics." }, { status: 500 }));
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
    const finalTempPath = tempPath; // Reference for closure

    const stream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        nodeStream.on("end", () => {
          controller.close();
          cleanupFile(finalTempPath);
        });
        nodeStream.on("error", (err) => {
          controller.error(err);
          cleanupFile(finalTempPath);
        });
      },
      cancel() {
        nodeStream.destroy();
        cleanupFile(finalTempPath);
      },
    });

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", fileSize.toString());
    
    // Set CORS headers on the stream response as well
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new NextResponse(stream, { headers });
  } catch (error: any) {
    cleanupFile(tempPath);
    console.error(`[DOWNLOAD API] Uncaught exception during download:`, error.message, error.stack);
    return withCors(NextResponse.json({ error: error.message || String(error) }, { status: 500 }));
  }
}
