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
  title: "AnyMedia — Download Media Instantly",
  description:
    "Fast, clean and simple media downloader. Paste a link, pick your format, and download. No sign up. No tracking. No ads.",
  keywords: [
    "media downloader",
    "video downloader",
    "audio downloader",
    "yt-dlp",
    "free downloader",
    "anymedia",
  ],
  authors: [{ name: "AnyMedia" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "AnyMedia — Download Media Instantly",
    description:
      "Fast, clean and simple media downloader. No sign up required.",
    siteName: "AnyMedia",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnyMedia — Download Media Instantly",
    description:
      "Fast, clean and simple media downloader. No sign up required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://anymedia.vercel.app/#organization",
        "name": "AnyMedia",
        "url": "https://anymedia.vercel.app",
        "logo": "https://anymedia.vercel.app/opengraph-image.png",
        "sameAs": [
          "https://www.instagram.com/ammar2712009",
          "https://wa.me/917801986978"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://anymedia.vercel.app/#website",
        "url": "https://anymedia.vercel.app",
        "name": "AnyMedia",
        "publisher": {
          "@id": "https://anymedia.vercel.app/#organization"
        }
      },
      {
        "@type": "Person",
        "@id": "https://anymedia.vercel.app/#person",
        "name": "Ammar Shaikh",
        "jobTitle": "Founder & Developer",
        "worksFor": {
          "@id": "https://anymedia.vercel.app/#organization"
        },
        "url": "https://anymedia.vercel.app/about",
        "sameAs": [
          "https://www.instagram.com/ammar2712009",
          "https://wa.me/917801986978"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://anymedia.vercel.app/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://anymedia.vercel.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": "https://anymedia.vercel.app/about"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
