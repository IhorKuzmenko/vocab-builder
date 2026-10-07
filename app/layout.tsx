import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const fixelDisplay = localFont({
  src: [
    {
      path: "./fonts/MacPawFixelDisplay-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MacPawFixelDisplay-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/MacPawFixelDisplay-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/MacPawFixelDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-fixel-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VocabBuilder",
  description:
    "VocabBuilder is an application for learning and improving your English vocabulary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fixelDisplay.variable}>{children}</body>
    </html>
  );
}
