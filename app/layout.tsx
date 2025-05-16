import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from './ClientProviders';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playlist Companion",
  description: "Get educational insights about your Spotify playlist tracks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <ClientProviders>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
