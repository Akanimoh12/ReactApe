import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ReactApe — Bored Ape Blitz on Somnia",
  description:
    "Catch falling apes, dodge bombs, submit your score on-chain. Powered by Somnia Reactivity.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
