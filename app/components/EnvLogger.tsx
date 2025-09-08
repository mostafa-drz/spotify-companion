'use server';

export default async function EnvLogger() {
  // Log environment variables for debugging
  console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
  console.log(
    'GCP_PROJECT_ID:',
    process.env.GCP_PROJECT_ID ? 'SET' : 'MISSING'
  );
  console.log(
    'GCP_CLIENT_EMAIL:',
    process.env.GCP_CLIENT_EMAIL ? 'SET' : 'MISSING'
  );
  console.log(
    'GCP_PRIVATE_KEY:',
    process.env.GCP_PRIVATE_KEY ? 'SET' : 'MISSING'
  );
  console.log(
    'FIREBASE_STORAGE_BUCKET_URI:',
    process.env.FIREBASE_STORAGE_BUCKET_URI ? 'SET' : 'MISSING'
  );
  console.log(
    'NEXTAUTH_SECRET:',
    process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING'
  );
  console.log(
    'SPOTIFY_CLIENT_ID:',
    process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'MISSING'
  );
  console.log(
    'SPOTIFY_CLIENT_SECRET:',
    process.env.SPOTIFY_CLIENT_SECRET ? 'SET' : 'MISSING'
  );
  console.log(
    'GEMINI_API_KEY:',
    process.env.GEMINI_API_KEY ? 'SET' : 'MISSING'
  );

  // Log actual values for debugging (same in all environments)
  console.log('GCP_PROJECT_ID value:', process.env.GCP_PROJECT_ID);
  console.log('GCP_CLIENT_EMAIL value:', process.env.GCP_CLIENT_EMAIL);
  console.log(
    'GCP_PRIVATE_KEY length:',
    process.env.GCP_PRIVATE_KEY?.length || 0
  );
  console.log(
    'FIREBASE_STORAGE_BUCKET_URI value:',
    process.env.FIREBASE_STORAGE_BUCKET_URI
  );

  console.log('=== END ENV DEBUG ===');

  return null; // This component doesn't render anything
}
