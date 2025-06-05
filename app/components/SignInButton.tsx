import { auth } from '@/app/auth';
import UnifiedSignInButton from './UnifiedSignInButton';

export default async function SignInButton() {
  const session = await auth();
  if (session) {
    return null;
  }
  return <UnifiedSignInButton />;
}
