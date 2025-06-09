# 🎵 Spotify Companion — Product Plan

## 📋 Overview

Spotify Companion is a minimal web application that enhances users' music listening experience by providing educational insights about their Spotify playlist tracks. Users can connect their Spotify account and receive AI-generated educational intros about the track currently playing on their Spotify device.

## 🎯 Product Vision

Spotify Companion creates a seamless, educational experience that helps users discover the rich history and context behind their favorite music. The app focuses on being:

- **Educational**: Provide meaningful insights about music
- **Fun**: Make learning about music engaging and enjoyable
- **Fast**: Quick, 1-minute blurbs that don't interrupt the listening experience
- **Integrated**: Seamlessly enhances the experience of whatever is currently playing on Spotify

## 🚀 v0.1 MVP Objectives

1. **User Authentication**

   - Spotify OAuth integration
   - Secure user session management
   - Basic user profile storage
   - Credit system initialization

2. **Now Playing Integration**

   - Use Spotify Web Playback SDK for real-time playback state, control, and event listening
   - App acts as a playback controller and intro injector
   - On play/track change, intercept playback, play intro, then resume track
   - Only use Spotify API for initial device transfer or fallback
   - Manage track-specific intro settings
   - Allow user to customize prompt template per track

3. **AI Integration**

   - Integration with Google Vertex AI via Firebase client SDK
   - Generate educational blurbs using Dotprompt format
   - Support for multiple output formats (markdown + SSML)
   - Customizable parameters:
     - Template prompt (selected from user/system templates)
     - Language preference
     - Tone selection (casual, academic, storytelling, conversational, professional)
     - Duration control (default: 60 seconds)
   - Store and manage prompt templates
   - Caching system for generated intros

4. **User Interface**
   - Clean, minimal design using TailwindCSS
   - Responsive layout
   - Loading states and error handling (all feedback is handled via minimal inline messages—no toast notifications or popups)
   - Real-time track display and intro controls
   - Prompt template selection and audio intro controls, with all template management (create, edit, delete, select) handled inline or via modal on the Now Playing page. There is no separate templates section.
   - Tone and language preference settings

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
- **External API**: Spotify Web API (for device transfer/fallback only)
- **Architecture**: Serverless-first approach with minimal API routes

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

## 📅 Development Phases

### Phase 1: Project Setup for Spotify Companion ✅

- [x] Initialize Next.js project
- [x] Configure TypeScript
- [x] Set up TailwindCSS
- [x] Configure Firebase client SDK
- [x] Basic project structure

### Phase 2: Authentication & Real-Time Track Integration

- [ ] Set up Spotify OAuth with NextAuth.js
- [ ] Implement login/logout flow
- [ ] Create user profile storage in Firestore
- [ ] Integrate Spotify Web Playback SDK for real-time playback state and control
- [ ] Display track metadata and playback controls

### Phase 3: AI Integration

- [ ] Set up Google Vertex AI via Firebase client SDK
- [ ] Implement Dotprompt system for intro generation
- [ ] Create prompt input interface with server actions
- [ ] Build results display with markdown support
- [ ] Implement SSML generation for TTS
- [ ] Add loading states and error handling

### Phase 4: Polish & Deploy

- [ ] Error handling (all feedback is handled via minimal inline messages—no toast notifications or popups)
- [ ] Loading states (no toast notifications or popups)
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

## 🔄 Future Enhancements for Spotify Companion (Post-MVP)

1. **Audio Integration**

   - Text-to-Speech for blurbs
   - Audio preview of tracks
   - Custom voice selection

2. **Social Features**

   - Share blurbs
   - Save favorite insights
   - Create custom collections

3. **Advanced AI Features**

   - Multiple prompt templates per track or genre
   - Focus on specific aspects (instruments, history, etc.)
   - Custom prompt suggestions
   - Template categories and tags
   - Advanced tone customization

4. **Analytics & Insights**

   - Track usage patterns
   - Popular prompts
   - User engagement metrics

5. **User Preferences**

   - Global settings for default behavior
   - Cross-playlist preferences
   - User-specific defaults
   - Language and tone preferences

6. **Credit System Enhancements**
   - Credit packages
   - Referral system
   - Usage analytics
   - Automated credit top-up
   - Credit expiration
   - Different credit costs for different features

## 📊 Success Metrics

- User engagement (time spent per session)
- Number of tracks analyzed
- User retention
- Prompt variety and usage
- Error rates and performance metrics
- Intro playback rate per track

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
- Credit system:
  - Initial demo credits for new users
  - Credit cost per intro generation (includes TTS)
  - Simple email-based support for credit top-ups
  - Low credit warnings and notifications
