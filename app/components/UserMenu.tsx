'use client';

import { useSession } from 'next-auth/react';
import { signOut } from '@/app/actions/auth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ContactModal from './ContactModal';
import TermsModal from './TermsModal';
import DeleteAccountModal from './DeleteAccountModal';
import CreditBalance from './CreditBalance';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTerms, setShowTerms] = useState(false);
  const user = session?.user;
  const avatarUrl = user?.image;
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  if (!session) {
    return null;
  }

  const openModal = (modal: string) => {
    if (modal === 'terms') {
      setShowTerms(true);
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('modal', modal);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name || user.email || 'User'}
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow-sm"
            />
          ) : (
            <span className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white font-bold text-lg border border-gray-200 dark:border-gray-700">
              {userInitials}
            </span>
          )}
          <ChevronDownIcon className="w-5 h-5 text-neutral" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-[#181818] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <CreditBalance />
              </div>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/playing"
                    className={classNames(
                      active ? 'bg-primary/10 text-primary' : 'text-foreground',
                      'block px-4 py-2 text-sm rounded-md transition-colors'
                    )}
                  >
                    Now Playing
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => openModal('delete-account')}
                    className={classNames(
                      active ? 'bg-primary/10 text-primary' : 'text-foreground',
                      'block w-full text-left px-4 py-2 text-sm rounded-md transition-colors'
                    )}
                  >
                    Delete My Data
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => openModal('contact')}
                    className={classNames(
                      active ? 'bg-primary/10 text-primary' : 'text-foreground',
                      'block w-full text-left px-4 py-2 text-sm rounded-md transition-colors'
                    )}
                  >
                    Contact Us
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => openModal('terms')}
                    className={classNames(
                      active ? 'bg-primary/10 text-primary' : 'text-foreground',
                      'block w-full text-left px-4 py-2 text-sm rounded-md transition-colors'
                    )}
                  >
                    Terms & Conditions
                  </button>
                )}
              </Menu.Item>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <Menu.Item>
                {({ active }) => (
                  <form action={signOut}>
                    <button
                      type="submit"
                      className={classNames(
                        active ? 'bg-primary/10 text-primary' : 'text-foreground',
                        'block w-full text-left px-4 py-2 text-sm rounded-md transition-colors'
                      )}
                    >
                      Sign Out
                    </button>
                  </form>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <ContactModal />
      <DeleteAccountModal />
      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          isSignup={false}
        />
      )}
    </>
  );
} 