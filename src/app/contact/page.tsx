import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — MediaDL",
  description: "Get in touch with the MediaDL team for support, feature requests, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          Contact Us
        </h1>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-lg">
            Have questions, feedback, or run into an issue with the downloader? We are here to help.
          </p>

          <div className="my-8 p-6 rounded-xl border border-white/5 bg-white/[0.01]">
            <h2 className="text-xl font-semibold text-white mb-2">Email Support</h2>
            <p className="mb-4">
              For general inquiries, bugs, and API partnerships, email us at:
            </p>
            <p className="text-lg font-mono text-indigo-400">
              support@mediadl.net
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Report an Issue</h2>
          <p>
            When reporting a downloading failure, please include the following details in your message:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The URL of the video or audio you are attempting to download.</li>
            <li>The format selected (resolution/bitrate).</li>
            <li>Your operating system and browser version.</li>
            <li>Any error messages displayed on the screen.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Response Time</h2>
          <p>
            We strive to respond to all inquiries within <strong className="text-white">24 to 48 hours</strong>. Please note that MediaDL is completely free and community-supported.
          </p>
        </div>
      </div>
    </div>
  );
}
