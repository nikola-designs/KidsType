import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kids Type",
  description: "Calm paper-first writing and drawing experience for young children."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html data-theme="cupcake" lang="en">
      <body>{children}</body>
    </html>
  );
}
