import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MediaDL",
  description: "Read the MediaDL privacy policy. We respect your data and maintain a strict zero-retention policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          Privacy Policy
        </h1>
        
        <p className="text-xs text-muted-foreground mb-8">Last Updated: June 22, 2026</p>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            At <strong>MediaDL</strong>, we prioritize the privacy and security of our visitors. This Privacy Policy document outlines the types of information we do and do not collect.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Zero Data Retention Policy</h2>
          <p>
            MediaDL operates as a fully stateless application:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do not require user accounts, signup, or login procedures.</li>
            <li>We never store or log client-submitted media URLs.</li>
            <li>No database is connected to this application. All parsing transactions happen dynamically in memory.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Server Operations & Temp Files</h2>
          <p>
            To fetch and package video files, the server creates small local temporary files on the hosting filesystem. These files are piped immediately back to your browser client and deleted using automated disk hooks as soon as the download finishes or terminates.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Log Files</h2>
          <p>
            Like most websites, our hosting servers may log standard connection information (such as browser type, IP address, referencing pages, and timestamps) for technical analytics and security maintenance. These logs are not paired with user actions and are automatically pruned.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Cookies and Advertising</h2>
          <p>
            MediaDL does not set application cookies or session tracking data. If advertising platforms (such as Google AdSense) are integrated in the future, they may place cookies on your browser to serve personalized ads. You can manage or disable advertising cookies in your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Contact Information</h2>
          <p>
            If you have questions regarding this policy, please reach out via email at: <span className="font-mono text-indigo-400">[ammarshaikh6100@gmail.com]</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
