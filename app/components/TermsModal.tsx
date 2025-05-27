import Modal from './ui/Modal';

interface TermsModalProps {
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ onClose, onAccept }: TermsModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Terms & Conditions</h2>
        <div className="space-y-8 text-sm text-neutral">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-2">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1 text-base">Demo Notice</h3>
            <p>
              This is a demo app for exploring AI and Spotify integration. Data may be lost at any time.
            </p>
          </div>

          <section>
            <h3 className="font-semibold text-foreground mb-2 text-base">What We Collect</h3>
            <ul className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-2 text-left">
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>Your Spotify account info (email, profile image, with your permission)</li>
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>What&apos;s currently playing on your Spotify account (track metadata, playback state)</li>
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>Your custom templates and generated intros</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 text-base">How We Use It</h3>
            <ul className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-2 text-left">
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>To show what&apos;s playing and generate AI intros</li>
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>To let you manage your templates and intros</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 text-base">Your Control</h3>
            <ul className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-2 text-left">
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>Delete all your data any time from the user menu (&quot;Delete My Data&quot;)</li>
              <li className="relative"><span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" aria-hidden="true"></span>No data is shared with third parties</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2 text-base">Data Security</h3>
            <p>
              Data is stored in Firebase and protected by industry-standard security.<br />
              No guarantee of data persistence (demo app).
            </p>
          </section>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onAccept}
            className="btn btn-primary flex-1"
          >
            I Accept
          </button>
          <button
            onClick={onClose}
            className="btn flex-1"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
} 