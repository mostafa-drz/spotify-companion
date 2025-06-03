# Now Playing Companion — User Story & Milestone Plan

## Executive Summary

This feature introduces a real-time "Now Playing" companion page (`/playing`) to Spotify Companion. The new experience focuses exclusively on generating and playing AI-powered educational intros for the currently playing Spotify track, blending seamlessly into the user's listening session. The implementation is focused, modern, and minimal, with no playlist-based or backward compatibility features. **The app uses the Spotify Web Playback SDK for all playback state, control, and event listening, acting as a true playback controller and intro injector.**

---

## 1. Real-Time Now Playing Experience

- **Goal:**  
  Provide users with instant, AI-generated educational intros for the track currently playing on their Spotify device, with minimal friction and maximum engagement.

- **User Flow:**
  1. User logs in via Spotify OAuth.
  2. User navigates to `/playing`.
  3. Spotify Web Playback SDK is initialized and connected.
  4. User clicks play (or next/previous):
     - If "intro" is enabled and the web app is open:
       - Pause the Spotify player.
       - Generate (or fetch) the intro (text + TTS).
       - Play the intro audio in the web app.
       - When the intro finishes, resume Spotify playback.
     - If "intro" is disabled, play as normal.
  5. All playback state, track changes, and controls are handled via the SDK, not polling.
  6. UI updates in real time based on SDK events.

---

## 2. High-Level Milestones

### **Milestone 1: Page & Infrastructure Setup**

- [x] Create `/playing` route and page in Next.js.
- [x] Add basic layout and navigation.
- [x] Ensure authentication and Spotify session are available.
  - _Done: `/playing` page and navigation link implemented._

### **Milestone 2: Real-Time Playback Integration**

- [x] Integrate Spotify Web Playback SDK for real-time playback state and control.
- [x] Listen for play/track change events to trigger intro logic.
- [x] Remove polling to `/me/player/currently-playing` in favor of SDK events.
  - _Done: SDK is now the source of truth for playback state._

### **Milestone 3: Intro Generation & Playback**

- [x] Add a toggle on the page to enable/disable intros for the currently playing track.
  - _Done: Toggle is implemented and working._
- [x] When the toggle is ON and a new track plays:
  - [x] Generate the intro script (text) for the track and save it to Firestore.
  - [x] Show status: generating, ready, error.
- [x] Generate AI-powered intro script using Genkit/Gemini with a well-structured prompt and all relevant track info.
  - _Done: AI service implemented using Genkit, integrated with Firestore._
- [x] Generate TTS audio for the intro and save to Storage.
  - _Done: TTS audio is generated and saved to Storage._
- [x] Play the intro audio in the browser before resuming the track.
  - _Done: Intro audio playback is orchestrated with Spotify player using the context. Spotify pauses for intro, resumes after._
- [x] Store and reuse intros per user + track.
- [x] Reuse existing intro generation logic (Firestore/Storage/AI/TTS).
- [ ] Add intro playback controls (play, skip, replay).
  - _In progress: Basic play/pause/replay controls are present. Further enhancements possible._

### **Milestone 4: UI/UX Enhancements**

- [ ] Design a focused, minimal UI for the now playing experience.
- [ ] Add progress/loading indicators for intro generation.
- [ ] Ensure accessibility (ARIA, keyboard navigation).
- [ ] Responsive design for mobile/desktop.

### **Milestone 5: Optional Enhancements (Post-MVP)**

- [ ] Track intro engagement metrics (play, skip, replay).
- [ ] Allow user to customize prompt per track or genre.
- [ ] Auto-suggest prompts based on track metadata.
- [ ] Use Spotify Web Playback SDK for full playback control.

---

## 3. Technical Considerations

- **Data Model:**

  - Use `users/{userId}/trackIntros/{trackId}` in Firestore for storing intros.
  - Store: `trackId`, `userId`, `prompt`, `introText`, `audioUrl`, `createdAt`, `updatedAt`.

- **Playback State:**

  - Use Spotify Web Playback SDK for all playback state, control, and event listening.
  - Only use Spotify API for initial device transfer or fallback.

- **Error Handling:**

  - Show clear feedback for API, AI, or TTS failures.
  - Allow retry for intro generation.

- **Security:**
  - Maintain secure access to user data and intros.
  - Enforce Firestore/Storage rules.

---

## 4. Success Criteria

- Users can visit `/playing` and see the currently playing track.
- For each new track, an AI-generated intro is available (or generated on demand).
- Users can play, skip, or replay intros.
- The experience is real-time, responsive, and accessible.
