import LoginButton from '@/app/components/SignInButton';
import TermsWrapper from '@/app/components/TermsWrapper';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { Suspense } from 'react';
import Image from 'next/image';
import heroMusic from '@/public/hero-music.png';
import { auth } from '@/app/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <ErrorBoundary>
        <main className="container mx-auto px-4">
          {/* Hero Section */}
          <Suspense>
            <section className="min-h-[calc(100vh-4rem)] flex items-center">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Illustration */}
                <div className="relative hover-lift transition-transform duration-200">
                  <div className="aspect-square rounded-xl flex items-center justify-center overflow-hidden">
                    <Image
                      src={heroMusic}
                      alt="Music app hero illustration"
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex flex-col space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-primary">
                    Discover Music&apos;s Hidden Stories
                  </h1>
                  <p className="text-lg text-neutral">
                    Enhance your Spotify experience with educational insights
                    about your favorite tracks.
                  </p>
                  <div className="pt-4 flex justify-center">
                    {session ? (
                      <Link
                        href="/playing"
                        className="btn-primary flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Now Playing
                      </Link>
                    ) : (
                      <TermsWrapper>
                        <LoginButton />
                      </TermsWrapper>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </Suspense>

          {/* How It Works Section */}
          <Suspense>
            <section className="py-16 space-y-24">
              {/* Step 1: Connect */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Step 1
                  </div>
                  <h2 className="text-3xl font-bold text-primary">
                    Connect Your Spotify
                  </h2>
                  <p className="text-lg text-neutral">
                    Connect your Spotify account to get started.
                  </p>
                </div>
                <div className="relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/step-1-connect-spotify.gif"
                    alt="Connect your Spotify account demonstration"
                    className="w-full h-full object-cover"
                    width={640}
                    height={360}
                    priority
                  />
                </div>
              </div>

              {/* Step 2: Listen */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/step-2-play-your-music.gif"
                    alt="Play your music and get AI-powered intros demonstration"
                    className="w-full h-full object-cover"
                    width={640}
                    height={360}
                    priority
                  />
                </div>
                <div className="order-1 md:order-2 space-y-4">
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Step 2
                  </div>
                  <h2 className="text-3xl font-bold text-primary">
                    Play Your Music
                  </h2>
                  <p className="text-lg text-neutral">
                    Play any track—Spotify Companion will detect what&apos;s
                    playing and prepare an AI-powered intro for you.
                  </p>
                </div>
              </div>

              {/* Step 3: Learn */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Step 3
                  </div>
                  <h2 className="text-3xl font-bold text-primary">
                    Discover Hidden Stories
                  </h2>
                  <p className="text-lg text-neutral">
                    Discover and customize educational intros for your music.
                    Use templates to personalize what you learn about each
                    track.
                  </p>
                </div>
                <div className="relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/step-3-discover-hidden-stories.gif"
                    alt="Discover and customize educational intros demonstration"
                    className="w-full h-full object-cover"
                    width={640}
                    height={360}
                    priority
                  />
                </div>
              </div>
            </section>
          </Suspense>
        </main>
      </ErrorBoundary>
    </div>
  );
}
