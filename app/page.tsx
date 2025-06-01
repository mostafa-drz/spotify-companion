import LoginButton from "@/app/components/SignInButton";
import TermsWrapper from "@/app/components/TermsWrapper";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { Suspense } from "react";
import Image from "next/image";
import heroMusic from "@/public/hero-music.png";

export default function Home() {
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
                    Enhance your Spotify experience with educational insights about your favorite tracks.
                  </p>
                  <div className="pt-4">
                    <TermsWrapper>
                      <LoginButton />
                    </TermsWrapper>
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
                    Start by connecting your Spotify account. We&apos;ll sync with your current playback to provide real-time insights.
                  </p>
                </div>
                <div className="relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center">
                  {/* Placeholder for illustration */}
                  <span className="text-4xl">🎧</span>
                </div>
              </div>

              {/* Step 2: Listen */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center">
                  {/* Placeholder for illustration */}
                  <span className="text-4xl">🎼</span>
                </div>
                <div className="order-1 md:order-2 space-y-4">
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Step 2
                  </div>
                  <h2 className="text-3xl font-bold text-primary">
                    Play Your Music
                  </h2>
                  <p className="text-lg text-neutral">
                    As you listen to your favorite tracks, we&apos;ll automatically detect what&apos;s playing and prepare fascinating insights.
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
                    Get instant access to educational content about the music you love - from historical context to interesting facts about the artists and their creative process.
                  </p>
                </div>
                <div className="relative aspect-video bg-neutral-light dark:bg-neutral rounded-xl flex items-center justify-center">
                  {/* Placeholder for illustration */}
                  <span className="text-4xl">📚</span>
                </div>
              </div>
            </section>
          </Suspense>
        </main>
      </ErrorBoundary>
    </div>
  );
}
