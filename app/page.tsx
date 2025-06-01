import LoginButton from "@/app/components/SignInButton";
import TermsWrapper from "@/app/components/TermsWrapper";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{" "}
          <span className="text-green-600">
            Spotify Companion
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your personal Spotify playlist assistant
        </p>

        <div className="mt-8 space-y-4">
          <TermsWrapper>
            <LoginButton />
          </TermsWrapper>
        </div>
      </main>
    </div>
  );
}
