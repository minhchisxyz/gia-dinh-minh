import type { Metadata } from "next";
import "./globals.css";
import {Be_Vietnam_Pro} from "next/font/google";
import {ReactNode} from "react";
import {Toaster} from "@/components/ui/sonner";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";

const vietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-vietnam'
})

export const metadata: Metadata = {
  title: "Gia đình mình",
  description: "Cloud storage for Minh Chí's family",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${vietnam.className} antialiased`}
      >
        {children}
      <Toaster />
      <Analytics/>
      <SpeedInsights/>
      </body>
    </html>
  );
}
