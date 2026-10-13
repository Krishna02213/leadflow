import "@fontsource-variable/dm-sans";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadFlow — Focus on the next conversation",
  description: "A calm, focused lead management workspace for modern sales teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

