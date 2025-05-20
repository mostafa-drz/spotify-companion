import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from './ClientProviders';
import Header from './components/Header';
import Link from 'next/link';

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-[#121212]`}>
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <nav className="w-full flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181818]">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-bold text-lg text-primary">nowtune.ai</Link>
                <Link href="/playing" className="text-neutral hover:text-primary transition-colors">Now Playing</Link>
              </div>
            </nav>
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
