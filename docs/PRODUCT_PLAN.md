# 🎵 Playlist Companion — Product Plan

## 📋 Overview
Playlist Companion is a minimal web application that enhances users' music listening experience by providing educational insights about their Spotify playlist tracks. Users can connect their Spotify account, select a playlist, and receive AI-generated educational blurbs about each track.

## 🎯 Product Vision
Create a seamless, educational experience that helps users discover the rich history and context behind their favorite music. The app focuses on being:
- **Educational**: Provide meaningful insights about music
- **Fun**: Make learning about music engaging and enjoyable
- **Fast**: Quick, 1-minute blurbs that don't interrupt the listening experience
- **Integrated**: Works directly with users' existing Spotify playlists

## 🚀 v0.1 MVP Objectives
1. **User Authentication**
   - Spotify OAuth integration
   - Secure user session management
   - Basic user profile storage

2. **Playlist Management**
   - Fetch and display user's Spotify playlists
   - Allow playlist selection
   - Display track information

3. **AI Integration**
   - Custom prompt input for users
   - Integration with Google Vertex AI via Firebase client SDK
   - Generate 1-minute educational blurbs per track

4. **User Interface**
   - Clean, minimal design using TailwindCSS
   - Responsive layout
   - Loading states and error handling

## 🛠 Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components with Heroicons
- **State Management**: React Context + Hooks
- **Server Components**: Leveraging Next.js 15 server components for improved performance
- **Server Actions**: Using Next.js server actions for form submissions and data mutations

### Backend
- **Authentication**: NextAuth.js with Spotify provider
- **Database**: Firebase Firestore (client SDK)
- **AI Service**: Google Vertex AI via Firebase client SDK
- **External API**: Spotify Web API
- **Architecture**: Serverless-first approach with minimal API routes

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

## 📅 Development Phases

### Phase 1: Project Setup ✅
- [x] Initialize Next.js project
- [x] Configure TypeScript
- [x] Set up TailwindCSS
- [x] Configure Firebase client SDK
- [x] Basic project structure

### Phase 2: Authentication & Spotify Integration
- [ ] Set up Spotify OAuth with NextAuth.js
- [ ] Implement login/logout flow
- [ ] Create user profile storage in Firestore
- [ ] Fetch user playlists
- [ ] Build playlist selection UI

### Phase 3: AI Integration
- [ ] Set up Google Vertex AI via Firebase client SDK
- [ ] Create prompt input interface with server actions
- [ ] Implement track analysis
- [ ] Build results display
- [ ] Add loading states

### Phase 4: Polish & Deploy
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Deploy to production

## 🔐 Environment Setup
Required environment variables:
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

## 🎨 UI/UX Guidelines
- **Color Scheme**: 
  - Primary: Green (#16a34a)
  - Secondary: Gray (#4b5563)
  - Background: Light Gray (#f9fafb)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid
- **Components**: Minimal, clean design with clear hierarchy

## 🔄 Future Enhancements (Post-MVP)
1. **Audio Integration**
   - Text-to-Speech for blurbs
   - Audio preview of tracks

2. **Social Features**
   - Share blurbs
   - Save favorite insights
   - Create custom collections

3. **Advanced AI Features**
   - Multiple prompt templates
   - Focus on specific aspects (instruments, history, etc.)
   - Custom prompt suggestions

4. **Analytics & Insights**
   - Track usage patterns
   - Popular prompts
   - User engagement metrics

## 📊 Success Metrics
- User engagement (time spent per session)
- Number of playlists analyzed
- User retention
- Prompt variety and usage
- Error rates and performance metrics

## 🔒 Privacy & Security
- Secure OAuth implementation
- Data minimization
- Clear privacy policy
- Regular security audits

## 💰 Cost Considerations
- Firebase usage limits
- Vertex AI API costs
- Spotify API rate limits
- Hosting and bandwidth

## 📝 Development Workflow
1. Feature branches from `main`
2. Pull requests for review
3. Automated testing
4. Staging deployment
5. Production release

## 🎯 Next Steps
1. Complete Spotify OAuth integration
2. Implement playlist fetching
3. Set up Vertex AI integration via Firebase client SDK
4. Build prompt interface with server actions
5. Deploy MVP version 