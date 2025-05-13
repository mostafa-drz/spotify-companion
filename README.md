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
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=

   # Spotify
   SPOTIFY_CLIENT_ID=
   SPOTIFY_CLIENT_SECRET=

   # Auth.js
   AUTH_SECRET=
   AUTH_URL=http://127.0.0.1:3000

   # Google Cloud
   GOOGLE_CLOUD_PROJECT=
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📚 Documentation

- [Product Plan](docs/PRODUCT_PLAN.md)
- [API Documentation](docs/API.md) (Coming soon)
- [Contributing Guidelines](docs/CONTRIBUTING.md) (Coming soon)

## 🔒 Privacy & Security

- We only request necessary Spotify permissions
- Your data is stored securely in Firebase
- We don't share your information with third parties

## 📝 License

MIT License - see [LICENSE](LICENSE) for details
