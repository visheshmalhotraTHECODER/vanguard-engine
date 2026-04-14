import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vanguard — Mission Control",
  description: "Self-hosted cloud deployment engine.",
};

import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} page-bg min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
