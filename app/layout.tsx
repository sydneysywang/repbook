import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Repbook",
  description: "Log workouts, reuse templates and track your progress.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3D8C7" },
    { media: "(prefers-color-scheme: dark)", color: "#16111A" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
        {/* Film grain over everything; decorative, never blocks taps. */}
        <div aria-hidden className="grain pointer-events-none fixed inset-0 z-40" />
      </body>
    </html>
  );
}
