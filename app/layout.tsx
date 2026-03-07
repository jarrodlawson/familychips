import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Chips",
  description: "Holiday chip tracker — who's got the goods?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
