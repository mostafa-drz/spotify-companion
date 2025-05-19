'use server'

import helloFlow from '@/app/lib/genKit';
import { verifyAuth } from '@/app/lib/firebase-admin';

export async function testHelloFlow(name: string) {
  try {
    // Verify authentication before proceeding
    await verifyAuth();
    
    // Proceed with GenKit operation
    await helloFlow(name);
    return { success: true };
  } catch (error) {
    console.error('Error in testHelloFlow:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to call helloFlow' 
    };
  }
} 