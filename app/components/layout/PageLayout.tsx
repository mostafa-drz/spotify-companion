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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212]">
      {showHeader && (
        <header className="bg-white dark:bg-[#121212] shadow-sm border-b border-neutral-light dark:border-neutral">
          <div className="container py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
              Playlist Companion
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/playlists" 
                className="text-neutral hover:text-primary transition-colors"
              >
                My Playlists
              </Link>
              <Link 
                href="/profile" 
                className="text-neutral hover:text-primary transition-colors"
              >
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
        <footer className="bg-white dark:bg-[#121212] border-t border-neutral-light dark:border-neutral">
          <div className="container py-6 text-center text-neutral">
            <p>© {new Date().getFullYear()} Playlist Companion</p>
          </div>
        </footer>
      )}
    </div>
  );
} 