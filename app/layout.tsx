import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './ClientProviders';
import Header from './components/Header';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spotify Companion - Educational Music Insights',
  description:
    'Enhance your Spotify experience with AI-generated educational insights about your favorite tracks. Discover hidden stories, artist backgrounds, and musical context while you listen.',
  keywords:
    'spotify, music education, AI insights, music companion, educational intros, music learning, spotify integration',
  authors: [
    { name: 'Mostafa Darehzereshki', url: 'https://github.com/mostafa-drz' },
  ],
  creator: 'Mostafa Darehzereshki',
  publisher: 'Mostafa Darehzereshki',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#1DB954', // Spotify green
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-screen bg-gray-50 dark:bg-[#121212]`}
      >
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
