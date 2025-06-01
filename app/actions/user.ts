"use server";

import { adminDb } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { UserTransaction } from "@/app/types/User";

const costPerTransaction: Record<UserTransaction, number> = {
    [UserTransaction.GENERATE_TRACK_INTRO]: 1,
}

async function updateUserCredits(userId: string, amount: number) {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
        availableCredits: FieldValue.increment(-amount),
    });
}

export async function chargeUser(userId: string, transaction: UserTransaction) {
    const cost = costPerTransaction[transaction];
    if (cost === undefined) {
        throw new Error(`Invalid transaction type: ${transaction}`);
    }
    await updateUserCredits(userId, cost);
    return {
        success: true,
        message: `User ${userId} charged for ${transaction}`,
    }
}