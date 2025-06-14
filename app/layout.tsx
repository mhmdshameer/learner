import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learner",
  description: "Learner is a platform for learning and teaching",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Learner",
    description: "Learner is a platform for learning and teaching",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learner",
    description: "Learner is a platform for learning and teaching",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} min-h-screen bg-[#f4f6fa]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
