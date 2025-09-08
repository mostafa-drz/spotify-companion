# 🎵 Spotify Companion

A minimal web application that enhances your music listening experience by providing educational insights about your Spotify playlist tracks.

## 🚀 Features

- Connect your Spotify account
- Select any of your playlists
- Get AI-generated educational blurbs about each track
- Simple credit system:
  - Start with demo credits
  - Clear credit balance display
  - Low credit warnings
  - Easy credit top-up via email
- Customize your learning experience:
  - Select preferred language
  - Pick from different tones (casual, academic, storytelling, etc.)
  - Control intro duration
  - Select a prompt template (e.g., "About the Artist", "Track Story") to guide the AI intro
- Manage your intro templates (create, edit, delete, select) directly from the Now Playing page—no separate templates section.
- All feedback (loading, errors, success) is handled via minimal inline messages—no toast notifications or popups, in line with the product's minimalism philosophy.
- Each track can have multiple intros, one per template, and switching templates instantly loads or generates the relevant intro.
- Enjoy both text and audio versions of the insights

## 🎬 Product Demo

[![Watch the demo](./public/step-2-play-your-music.gif)](https://youtu.be/5wtlfmVnRYg)

[Watch on YouTube](https://youtu.be/5wtlfmVnRYg)

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Server Components**: Next.js 15 server components for improved performance
- **Server Actions**: Next.js server actions for form submissions
- **Authentication**: NextAuth.js with Spotify provider
- **Database**: Firebase Firestore (client SDK)
- **AI**: Google Vertex AI via Firebase client SDK
- **APIs**: Spotify Web API
- **Prompt System**: Dotprompt for structured AI interactions

## 🧠 GenKit Integration (AI-Powered Features)

This project uses [Genkit](https://github.com/firebase/genkit), an open-source framework by Google for building full-stack AI-powered apps. It provides a streamlined way to integrate models like **Google Gemini**, **OpenAI**, **Anthropic**, and others—abstracting away the complexity of prompt engineering, model selection, and output structuring.

### ✨ Why Genkit?

- **Unified Interface**: One SDK, many model providers
- **Prompt System**: `.prompt` files with structured inputs/outputs and templating
- **Tooling**: Visual Developer UI for live prompt testing and debugging
- **Serverless Ready**: Pairs well with Firebase and frontend-first architectures

### ⚙️ Implementation Details

1. **Prompt Definition** (`app/lib/prompts/intro.prompt`):

   ```yaml
   ---
   model: googleai/gemini-2.0-flash
   input:
     schema:
       trackDetailsJSON: string
       templatePrompt: string
       language?: string
       tone?: string
       length?: number
     default:
       tone: 'conversational'
       length: 60
   output:
     schema:
       markdown: string
       ssml: string
       duration: number
   ---
   ```

2. **GenKit Configuration** (`app/lib/genKit.ts`):

   ```typescript
   const ai = genkit({
     plugins: [googleAI()],
     model: gemini15Flash,
     promptDir: './app/lib/prompts',
   });
   ```

3. **Service Layer** (`app/lib/ai.ts`):

   - Single entry point for AI interactions
   - Parameter-based caching with Firestore
   - Type-safe input/output handling

4. **Caching Strategy**:
   - Cache invalidation based on:
     - Language
     - Tone
     - Length
     - Template prompt
     - Automatic regeneration when parameters change
     - Firestore for persistent storage

### 🧪 Local Dev Guide

1. **Get API Access**

   - [Generate a Gemini API key](https://makersuite.google.com/app/apikey)
   - Set it in `.env.local` as `GEMINI_API_KEY`

2. **Start Genkit Dev UI**

   ```bash
   genkit start -- tsx --watch src/app.ts
   ```

3. **Test & Export Prompts**
   - Modify and test `.prompt` files interactively
   - Export finalized versions to `prompts/`

> Schema validation is powered by **Picoschema**, a concise YAML schema format optimized for AI inputs/outputs.

### 🔗 Helpful Resources

- 📘 [Genkit Docs](https://firebaseopensource.com/projects/firebase/genkit/)
- 🧪 [Genkit by Example](https://firebaseopensource.com/projects/firebase/genkit/examples/)
- 🧠 [Dotprompt Spec](https://firebaseopensource.com/projects/firebase/genkit/docs/prompts/)

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
   # Google Cloud Service Account (used in all environments)
   GCP_PROJECT_ID=your-gcp-project-id
   GCP_CLIENT_EMAIL=service-account@your-gcp-project-id.iam.gserviceaccount.com
   # If pasting as a single line, keep \n escapes; the code converts them
   GCP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBK...\n-----END PRIVATE KEY-----\n
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

   The app uses a single service account across environments via env vars:

   1. Go to Firebase Console > Project Settings > Service Accounts
   2. Click "Generate New Private Key" and download the JSON
   3. Set `GCP_PROJECT_ID`, `GCP_CLIENT_EMAIL`, and `GCP_PRIVATE_KEY` in `.env.local`
      - If you paste the private key in one line, keep `\n` escapes; the code converts them at runtime
   4. Do not commit secrets; prefer your platform's secret manager for production

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
- Credit system is transparent and user-friendly

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## Developer Tooling & Workflow

This project uses automated tooling to ensure code quality and consistency:

### Available Commands

- `npm run lint` — Run ESLint on the codebase
- `npm run format` — Format code with Prettier
- `npm run ts:check` — Run TypeScript type checking

### Pre-commit Hooks

- Pre-commit hooks are set up with Husky and lint-staged.
- On every commit, staged files are automatically linted and formatted. Commits will be blocked if there are any errors.

### Editor Integration

- VSCode users: Format-on-save and ESLint auto-fix are enabled by default (see `.vscode/settings.json`).

### Configuration Files

- ESLint: `eslint.config.mjs`
- Prettier: `.prettierrc`
- lint-staged: in `package.json`
- Husky: `.husky/` directory

For more details, see the user story in `docs/userStories/dev-experience-tooling.md`.

## ⚡️ Environment Variables

### Local Development

- Use a `.env.local` file in the root directory to provide all required environment variables (see below for a template).
- This is sufficient for running the app locally.
