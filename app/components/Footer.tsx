export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-xs text-neutral-500 border-t border-neutral-800 mt-12">
      © {new Date().getFullYear()} Spotify Companion
    </footer>
  );
}
