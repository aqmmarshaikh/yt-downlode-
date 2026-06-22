import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MediaDL — Premium Media Downloader",
    short_name: "MediaDL",
    description: "Fast, clean and simple media downloader. No sign up. No tracking. No ads.",
    start_url: "/",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#6366F1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
