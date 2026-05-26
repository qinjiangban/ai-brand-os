import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GEO 企业版运营平台",
  description: "ToB 企业版 GEO 全流程运营平台 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSansSc.variable} ${jetBrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
