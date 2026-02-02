import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingNewsletter from "@/components/FloatingNewsletter";
import NewsletterModal from "@/components/NewsletterModal";
import Providers from "@/components/Providers";

// Serif 字體 - 標題使用
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap", // 避免閃爍
});

// Sans-serif 字體 - 內文使用
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // 避免閃爍
});

export const metadata: Metadata = {
  title: {
    default: "全域影響力超業學院 - 培育頂尖超業人才",
    template: "%s | 全域影響力超業學院",
  },
  description: "全域影響力超業學院致力於連結專業講師與學員，提供高品質的超業培訓課程。我們相信，每一場課程都能開啟成功之門，創造無限可能。",
  keywords: ["超業", "銷售", "業務", "講師", "培訓", "課程", "教育", "全域影響力"],
  authors: [{ name: "全域影響力超業學院" }],
  creator: "全域影響力超業學院",
  metadataBase: new URL("https://campus-lecture-website.vercel.app"),
  openGraph: {
    title: "全域影響力超業學院 - 培育頂尖超業人才",
    description: "全域影響力超業學院致力於連結專業講師與學員，提供高品質的超業培訓課程。",
    url: "https://campus-lecture-website.vercel.app",
    siteName: "全域影響力超業學院",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "全域影響力超業學院 - 培育頂尖超業人才",
    description: "全域影響力超業學院致力於連結專業講師與學員，提供高品質的超業培訓課程。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* 抑制 TipTap AbortError 在開發模式的錯誤覆蓋 */}
        <Script id="suppress-abort-error" strategy="beforeInteractive">{`
          (function() {
            if (typeof window !== 'undefined') {
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('signal is aborted') || e.message.includes('AbortError'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (e.reason.name === 'AbortError' || String(e.reason).includes('signal is aborted'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }, true);
            }
          })();
        `}</Script>
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-black text-white`}
      >
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <FloatingNewsletter />
          <NewsletterModal />
        </Providers>
      </body>
    </html>
  );
}
