import { signOut } from '@/app/actions/auth';
import Button from './ui/Button';

export default function SignOutButton() {
  return (
    <form
      action={signOut}
    >
      <Button
        type="submit"
        variant="ghost"
        className="text-sm"
      >
        Sign Out
      </Button>
    </form>
  );
} 