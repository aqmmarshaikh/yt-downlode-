import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — MediaDL",
  description: "Read our Cookie Policy. MediaDL does not use cookies for tracking or persistence.",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          Cookie Policy
        </h1>
        
        <p className="text-xs text-muted-foreground mb-8">Last Updated: June 22, 2026</p>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            Welcome to the Cookie Policy for <strong>MediaDL</strong>. Our policy explains how cookies and similar tracking methods are used on our platform.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. What Are Cookies?</h2>
          <p>
            Cookies are tiny text files stored on your browser by websites you visit. They are commonly used to store settings, user preferences, or login sessions.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Zero Cookies Stored by MediaDL</h2>
          <p>
            To deliver an entirely private download experience, the core functionality of MediaDL:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Does not</strong> create or store application cookies on your browser.</li>
            <li><strong>Does not</strong> use local storage or session storage for tracking.</li>
            <li>Keeps all transaction parameters strictly in-memory during active sessions.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Third-Party Ads (Google AdSense)</h2>
          <p>
            We may show advertisements on our website through Google AdSense. Google AdSense uses cookies to serve ads based on your previous visits to our website or other sites.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google&apos;s <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Ads Settings</a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Managing Cookies</h2>
          <p>
            You can choose to disable cookies through your browser&apos;s individual settings. To learn more about cookie settings in specific web browsers, visit your browser&apos;s help or documentation center.
          </p>
        </div>
      </div>
    </div>
  );
}
