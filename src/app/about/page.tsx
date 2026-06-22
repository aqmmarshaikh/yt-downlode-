import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — MediaDL",
  description: "Learn more about MediaDL, the privacy-first media downloader. Fast, clean, and completely stateless.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          About MediaDL
        </h1>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-lg">
            Welcome to <strong className="text-white">MediaDL</strong>, a premium, modern, and privacy-focused media downloader designed to deliver a clean web experience free from trackers, cookies, and intrusive advertising.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
          <p>
            The internet is full of downloading utilities that bombard visitors with malicious redirects, popups, and tracking script collections. Our goal was simple: to construct a completely secure, lightweight, and high-performance alternative that respects user privacy and system security.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">How It Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Zero Storage:</strong> We never log or store URLs you paste. All analytical parsing is performed in-memory during your browser session.</li>
            <li><strong>Direct Streaming:</strong> Files are processed and streamed on the fly. We maintain no cache of your media.</li>
            <li><strong>Fully Automated:</strong> Utilizing powerful server-side scrapers like <code className="text-indigo-400 bg-white/5 px-1.5 py-0.5 rounded">yt-dlp</code>, the application decodes high-quality audio and video formats directly.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Key Features</h2>
          <p>
            MediaDL is designed to support direct links and social media reels, shorts, and standard videos from platforms like YouTube, Instagram, Facebook, TikTok, and Twitter/X. Every download is parsed with clean file names mapping back to original platform titles without generating random UUIDs.
          </p>
        </div>
      </div>
    </div>
  );
}
