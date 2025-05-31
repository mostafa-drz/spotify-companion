'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteUser } from '@/app/lib/firestore';
import { useSession, signOut } from 'next-auth/react';

export default function DeleteAccountModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get('modal') === 'delete-account';
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  const onClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('modal');
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error('User ID is required');
      }
      setIsDeleting(true);
      
      // Delete user data from Firestore
      await deleteUser(session.user.id);
      
      // Sign out from both NextAuth and Firebase
      await signOut({ redirect: false });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.log(error);
      setIsDeleting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#181818] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-foreground"
                  >
                    Delete Account
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5 text-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-foreground/80">
                    Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}