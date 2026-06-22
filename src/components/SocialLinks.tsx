"use client";

import { motion } from "framer-motion";

// Inline SVG Icons to support older lucide-react versions safely
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

export function SocialLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Instagram Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl flex flex-col items-center text-center justify-between relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-orange-500/5 pointer-events-none" />
        
        <div className="space-y-4 w-full flex flex-col items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <InstagramIcon className="h-5 w-5 text-pink-500" />
            Connect on Instagram
          </h2>

          {/* QR Code Container */}
          <div className="relative w-32 h-32 rounded-xl bg-white p-2 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <img
              src="/instagram-qr.png"
              alt="Instagram QR Code — @ammar2712009"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Scan QR or click below to follow <span className="text-white font-medium">@ammar2712009</span>
          </p>
        </div>

        <a
          href="https://www.instagram.com/ammar2712009"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10"
        >
          <span>Follow on Instagram</span>
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </motion.div>

      {/* WhatsApp Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl flex flex-col items-center text-center justify-between relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />

        <div className="space-y-4 w-full flex flex-col items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareIcon className="h-5 w-5 text-emerald-500" />
            Connect on WhatsApp
          </h2>

          {/* Custom WhatsApp Icon/QR visual placeholder */}
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <MessageSquareIcon className="w-10 h-10 text-emerald-500" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Chat Directly</p>
            <p className="text-xs text-muted-foreground">
              Questions or suggestions? Message us on our official support line.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/917801986978"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <span>Chat on WhatsApp</span>
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </motion.div>
    </div>
  );
}
