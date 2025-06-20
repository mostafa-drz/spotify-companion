'use server';

import { adminDb } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { UserTransaction } from '@/app/types/User';
import { LOW_CREDIT_THRESHOLD, INITIAL_CREDITS } from '@/app/lib/constants';

const costPerTransaction: Record<UserTransaction, number> = {
  [UserTransaction.GENERATE_TRACK_INTRO]: 1,
};

/**
 * Initialize credits for a new user
 */
export async function initializeUserCredits(userId: string): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.set(
    {
      admin: {
        availableCredits: INITIAL_CREDITS,
        usedCredits: 0,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Check if user has sufficient credits for a transaction
 */
export async function hasSufficientCredits(
  userId: string,
  transaction: UserTransaction
): Promise<boolean> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (!userData) {
    return false;
  }

  const cost = costPerTransaction[transaction];
  if (cost === undefined) {
    return false;
  }

  return userData.admin.availableCredits >= cost;
}

/**
 * Get user's credit balance
 */
export async function getUserCredits(
  userId: string
): Promise<{ available: number; used: number } | { error: string }> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (!userData) {
    return {
      error: 'User not found',
    };
  }

  if (!userData.admin) {
    return {
      error: 'User admin data not found',
    };
  }

  return {
    available: userData.admin.availableCredits,
    used: userData.admin.usedCredits,
  };
}

/**
 * Deduct credits for a transaction
 */
export async function deductCredits(
  userId: string,
  transaction: UserTransaction
): Promise<{ error: string } | void> {
  const cost = costPerTransaction[transaction];
  if (cost === undefined) {
    return {
      error: `Invalid transaction type: ${transaction}`,
    };
  }

  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (!userData) {
    return {
      error: 'User not found',
    };
  }

  if (!userData.admin) {
    return {
      error: 'User admin data not found',
    };
  }

  if (userData.admin.availableCredits < cost) {
    return {
      error: 'Insufficient credits',
    };
  }

  await userRef.set(
    {
      admin: {
        availableCredits: userData.admin.availableCredits - cost,
        usedCredits: userData.admin.usedCredits + cost,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Check if user has low credits
 */
export async function hasLowCredits(userId: string): Promise<boolean> {
  const userCredits = await getUserCredits(userId);
  if ('error' in userCredits) {
    return false;
  }
  return userCredits.available <= LOW_CREDIT_THRESHOLD;
}
