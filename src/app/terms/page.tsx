import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — MediaDL",
  description: "Review the terms and conditions for using MediaDL. Understand copyright rules and personal use disclaimers.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          Terms and Conditions
        </h1>
        
        <p className="text-xs text-muted-foreground mb-8">Last Updated: June 22, 2026</p>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            Welcome to <strong>MediaDL</strong>. By accessing or using our website, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Use of the Service</h2>
          <p>
            MediaDL is designed to allow users to download and extract media for personal, offline, and educational uses. You agree to use this site strictly in compliance with applicable local and international copyright laws.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Intellectual Property Rights</h2>
          <p>
            Users are solely responsible for ensuring they have the legal right or permission to download the content they submit to our parser. MediaDL does not host, store, or distribute any media files on its servers. We act purely as a technical streaming conduit.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Prohibited Use</h2>
          <p>
            You agree not to use the service for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Infringing on the intellectual property, copyright, or trademark rights of third parties.</li>
            <li>Attempting to disrupt or exploit the server APIs or backend subprocesses.</li>
            <li>Using automated crawlers to overload the downloader infrastructure.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            MediaDL is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising out of your use or inability to use the site or files downloaded through the application.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time without prior notice. Continued use of the website following changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}
