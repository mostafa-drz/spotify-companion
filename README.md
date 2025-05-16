# 🎵 Playlist Companion

A minimal web application that enhances your music listening experience by providing educational insights about your Spotify playlist tracks.

## 🚀 Features

- Connect your Spotify account
- Select any of your playlists
- Enter custom learning prompts
- Get AI-generated educational blurbs about each track

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Server Components**: Next.js 15 server components for improved performance
- **Server Actions**: Next.js server actions for form submissions
- **Authentication**: NextAuth.js with Spotify provider
- **Database**: Firebase Firestore (client SDK)
- **AI**: Google Vertex AI via Firebase client SDK
- **APIs**: Spotify Web API

## 🏗️ Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/playlist-companion.git
   cd playlist-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Firebase Admin SDK (Local Development)
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Spotify
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

   # JWT
   JWT_SECRET=your-jwt-secret

   # Google AI (GenKit)
   GEMINI_API_KEY=your-gemini-api-key
   ```

   ### Setting up Firebase Admin SDK
   Choose one of the following authentication methods:

   #### Option 1: Service Account (Recommended for local development)
   1. Go to Firebase Console > Project Settings > Service Accounts
   2. Click "Generate New Private Key"
   3. Save the downloaded JSON file securely (e.g., in a `secrets` directory)
   4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file
   
   Note: Add the service account JSON file to `.gitignore` to keep it secure

   #### Option 2: Google Application Default Credentials (ADC)
   For production environments on Google Cloud Platform:
   1. No environment variables needed
   2. Ensure your GCP project has the necessary IAM roles:
      - Firebase Admin
      - Cloud Firestore Admin
      - Firebase Authentication Admin
   3. The application will automatically use the service account associated with your GCP project

   ### Setting up Firebase Client
   1. Go to Firebase Console > Project Settings > General
   2. Scroll down to "Your apps" section
   3. If no web app exists, click "Add app" and choose Web
   4. Register your app and copy the configuration values

   ### Setting up NextAuth
   Generate a secure random string for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

   ### Setting up Spotify
   1. Go to Spotify Developer Dashboard
   2. Create a new application or select existing one
   3. Add the redirect URI in the app settings

   ### Setting up JWT
   Generate a secure random string for `JWT_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

   ### Setting up Google AI (GenKit)
   1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)
   2. Create a new API key
   3. Copy the API key to `GEMINI_API_KEY`
   4. Ensure your service account has the necessary permissions:
      - Vertex AI User
      - Vertex AI Service Agent

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep your private keys and secrets secure
- Rotate secrets periodically
- Use different values for development and production
- Consider using a secrets manager for production

## 📚 Documentation

- [Product Plan](docs/PRODUCT_PLAN.md)

## 🔒 Privacy & Security

- We only request necessary Spotify permissions
- Your data is stored securely in Firebase
- We don't share your information with third parties

## 📝 License

MIT License - see [LICENSE](LICENSE) for details