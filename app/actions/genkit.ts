'use server'

import helloFlow from '@/app/lib/genKit';

export async function testHelloFlow(name: string) {
  try {
    await helloFlow(name);
    return { success: true };
  } catch (error) {
    console.error('Error calling helloFlow:', error);
    return { success: false, error: 'Failed to call helloFlow' };
  }
} 