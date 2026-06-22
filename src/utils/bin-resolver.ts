import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

let isResolved = false;

/**
 * Resolves yt-dlp and ffmpeg paths installed by winget or system
 * and appends them to process.env.PATH so child processes can locate them.
 */
export function resolveBinaries() {
  if (isResolved) return;

  try {
    const pathsToAdd: string[] = [];

    // 1. Resolve WinGet Links directory (where yt-dlp.exe is linked)
    const home = homedir();
    const wingetLinksPath = join(home, "AppData", "Local", "Microsoft", "WinGet", "Links");
    if (existsSync(wingetLinksPath)) {
      pathsToAdd.push(wingetLinksPath);
    }

    // 2. Resolve WinGet Packages directory for FFmpeg
    const wingetPackagesPath = join(home, "AppData", "Local", "Microsoft", "WinGet", "Packages");
    if (existsSync(wingetPackagesPath)) {
      const folders = readdirSync(wingetPackagesPath);
      // Look for the FFmpeg folder
      const ffmpegFolder = folders.find((f) => f.toLowerCase().includes("yt-dlp.ffmpeg"));
      if (ffmpegFolder) {
        const ffmpegParentDir = join(wingetPackagesPath, ffmpegFolder);
        // Find subfolders (usually contains something like ffmpeg-N-124716-g054dffd133-win64-gpl)
        const subfolders = readdirSync(ffmpegParentDir);
        for (const sub of subfolders) {
          const binPath = join(ffmpegParentDir, sub, "bin");
          if (existsSync(binPath)) {
            pathsToAdd.push(binPath);
          }
        }
      }

      // Look for any direct yt-dlp folder in case it is there instead of links
      const ytdlpFolder = folders.find((f) => f.toLowerCase().includes("yt-dlp.yt-dlp"));
      if (ytdlpFolder) {
        const ytdlpParentDir = join(wingetPackagesPath, ytdlpFolder);
        if (existsSync(ytdlpParentDir)) {
          pathsToAdd.push(ytdlpParentDir);
        }
      }
    }

    if (pathsToAdd.length > 0) {
      const separator = process.platform === "win32" ? ";" : ":";
      const currentPath = process.env.PATH || "";
      
      // Combine and filter out duplicates
      const newPaths = pathsToAdd.filter(p => !currentPath.includes(p));
      if (newPaths.length > 0) {
        process.env.PATH = `${newPaths.join(separator)}${separator}${currentPath}`;
      }
    }
  } catch (error) {
    console.error("Failed to dynamically resolve binaries:", error);
  } finally {
    isResolved = true;
  }
}
