import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — MediaDL",
  description: "Read the legal disclaimer for using MediaDL. Understand copyright limits and platform responsibilities.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          Legal Disclaimer
        </h1>
        
        <p className="text-xs text-muted-foreground mb-8">Last Updated: June 22, 2026</p>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            The information and services provided by <strong>MediaDL</strong> are for general informational and personal use only.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Copyright & Fair Use</h2>
          <p>
            MediaDL does not encourage or condone the unauthorized download of copyrighted content. You must ensure you hold the appropriate distribution rights or possess clear permissions from the copyright owner before downloading any media.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Technical Intermediary</h2>
          <p>
            This application behaves strictly as a technical intermediary:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do not host, re-upload, or store any file libraries on our hosting environment.</li>
            <li>All download links provided connect directly to public CDNs or stream resources hosted by their respective platforms.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. External Links & APIs</h2>
          <p>
            We do not control the terms, contents, or API reliability of external platforms (like YouTube, TikTok, or Instagram). Use of these services is subject to their individual terms of use and policies.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. No Warranties</h2>
          <p>
            We do not warrant that our service will be uninterrupted, error-free, or compatible with all devices. We reserve the right to suspend operations at any time without notice.
          </p>
        </div>
      </div>
    </div>
  );
}
