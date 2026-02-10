import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Analyzer — AI-Powered Paper Analysis",
  description: "Paste any research paper and get an instant AI-powered breakdown: plain English summary, key findings, methodology review, and practical applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
