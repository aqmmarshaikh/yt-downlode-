import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediaDL — Download Media Instantly",
  description:
    "Fast, clean and simple media downloader. Paste a link, pick your format, and download. No sign up. No tracking. No ads.",
  keywords: [
    "media downloader",
    "video downloader",
    "audio downloader",
    "yt-dlp",
    "free downloader",
  ],
  authors: [{ name: "MediaDL" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "MediaDL — Download Media Instantly",
    description:
      "Fast, clean and simple media downloader. No sign up required.",
    siteName: "MediaDL",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaDL — Download Media Instantly",
    description:
      "Fast, clean and simple media downloader. No sign up required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
