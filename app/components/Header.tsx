import Link from 'next/link';
import UserMenu from './UserMenu';
import SignInButton from './SignInButton';
import { auth } from '@/app/auth';

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-[#1DB954] hover:text-opacity-90 transition-all duration-200"
          >
            Spotify Companion
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link href="/playing" className="text-neutral hover:text-primary transition-colors font-medium">Now Playing</Link>
            {session ? <UserMenu /> : <SignInButton />}
          </nav>
        </div>
      </div>
    </header>
  );
} 