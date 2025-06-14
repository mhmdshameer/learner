import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learner",
  description: "Learner is a platform for learning and teaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
