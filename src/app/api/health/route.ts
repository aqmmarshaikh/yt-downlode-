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
 * Asynchronously checks if a command is available on the path by spawning it.
 */
function checkCommand(cmd: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const child = spawn(cmd, args);
      child.on("error", () => {
        resolve(false);
      });
      child.on("close", () => {
        resolve(true);
      });
      // Timeout fallback in case it blocks
      const timer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {}
        resolve(true);
      }, 2500);
      child.on("close", () => clearTimeout(timer));
    } catch {
      resolve(false);
    }
  });
}

/**
 * GET /api/health
 * Returns diagnostic details about the runtime container.
 */
export async function GET() {
  resolveBinaries();

  const [ytDlpInstalled, ffmpegInstalled, pythonInstalled] = await Promise.all([
    checkCommand("yt-dlp", ["--version"]),
    checkCommand("ffmpeg", ["-version"]),
    checkCommand("python3", ["--version"]),
  ]);

  return NextResponse.json(
    {
      node: process.version,
      platform: process.platform,
      ytDlpInstalled,
      ffmpegInstalled,
      pythonInstalled,
    },
    { headers: corsHeaders }
  );
}
