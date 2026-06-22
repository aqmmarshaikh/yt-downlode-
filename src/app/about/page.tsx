import type { Metadata } from "next";
import Link from "next/link";
import { AboutFounder } from "@/components/AboutFounder";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "About Us — AnyMedia",
  description: "Meet Ammar Shaikh, the founder of AnyMedia. Learn about our mission to build fast, clean, and ad-free internet tools.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* About Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent sm:text-4xl mb-6">
          About AnyMedia
        </h1>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-lg font-medium text-white">
            Hi, I&apos;m Ammar Shaikh.
          </p>
          <p className="text-lg">
            I created <strong className="text-white">AnyMedia</strong> to provide a fast, clean, and simple media downloading experience without annoying ads or unnecessary distractions.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
          <p>
            To build useful and user-friendly internet tools that save people&apos;s time.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">How It Works</h2>
          <p>
            AnyMedia is fully stateless. When you paste a link, the backend decodes standard streaming resources and presents you with options to download directly in video (MP4, WebM, MOV) or audio (MP3, M4A) formats. Your details are never saved, keeping your workflow completely secure.
          </p>

          <p className="text-sm mt-6">
            Need to get in touch? Visit our <Link href="/contact" className="text-indigo-400 hover:underline">Contact Page</Link> or review our <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Founder Section */}
      <AboutFounder />

      {/* Social Links Connect Section */}
      <SocialLinks />
    </div>
  );
}
