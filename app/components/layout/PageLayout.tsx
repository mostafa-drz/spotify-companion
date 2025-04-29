import { ReactNode } from 'react';
import Link from 'next/link';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && (
        <header className="bg-white shadow-sm">
          <div className="container py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Playlist Companion
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/playlists" className="text-secondary hover:text-primary">
                My Playlists
              </Link>
              <Link href="/profile" className="text-secondary hover:text-primary">
                Profile
              </Link>
            </nav>
          </div>
        </header>
      )}
      
      <main className="flex-grow container py-8">
        {children}
      </main>
      
      {showFooter && (
        <footer className="bg-gray-50 border-t">
          <div className="container py-6 text-center text-secondary">
            <p>© {new Date().getFullYear()} Playlist Companion</p>
          </div>
        </footer>
      )}
    </div>
  );
} 