# User Story: Seamless Auto-Intro Playback Experience in Now Playing

**As a** Spotify Companion user,  
**I want** a seamless, clear, and predictable experience when auto-intros are enabled,  
**so that** I always know what's happening (generating, playing, resuming), my music isn't interrupted unexpectedly, and I can easily control or skip intros.

---

## Acceptance Criteria

- When auto-intro is enabled, the app pauses the track, generates (if needed), and plays the intro before resuming the track.
- The UI clearly communicates each state: generating intro, playing intro, resuming track.
- Credit usage is visible and transparent.
- Users can skip intros if they wish.
- Manual intro generation is available and clear when auto-intro is off.
- The implementation avoids code duplication and is scalable for future enhancements.

---

## Tasks

### 1. Explore and Document Current Implementation
- [x] Review the Now Playing page (`app/playing/page.tsx`) for how intros are triggered, played, and how playback is managed.
- [x] Identify where in the codebase intro generation is handled (both text and audio), and how the UI is updated during this process.
- [x] Review backend/server actions related to intro generation and caching.
- [x] Check for any existing UI components or hooks that manage loading, playback state, and credit usage.
- [x] Document any code that handles edge cases (e.g., rapid track skipping, playback transfer).

### 2. Design the Improved Workflow
- [x] Define the exact UI states:  
  - Generating intro  
  - Playing intro  
  - Resuming track  
  - Error/skip states
- [x] Specify where and how to show credit usage and warnings.
- [x] Design the "Skip Intro" and "Generate Intro" button behaviors.
- [x] Ensure accessibility and minimal, inline feedback (no popups/toasts).

### 3. Backend/Server Actions Review
- [x] Ensure intro generation (text/audio) is efficient and not duplicated for the same track/template.
- [x] Confirm that intro caching works as expected and is used by the UI.
- [x] Check if backend can support pre-generation or queuing for upcoming tracks (for future scalability).

### 4. Implement UI/UX Improvements
- [x] Add/modify UI components to reflect the new workflow (loading spinners, progress bars, state messages).
- [x] Integrate credit usage display and warnings.
- [x] Implement "Skip Intro" and manual "Generate Intro" actions.
- [x] Ensure playback controls are appropriately enabled/disabled during each state.

### 5. Testing & Edge Cases
- [ ] Test rapid track skipping, playback transfer, and low-credit scenarios.
- [ ] Ensure no duplicate intros are generated.
- [ ] Validate that the experience is smooth on both desktop and mobile.

### 6. Documentation & Handover
- [ ] Update user documentation to reflect the new workflow.
- [ ] Add comments and code documentation for future maintainers.

---

## Open Questions

- Should "Skip Intro" immediately resume the track, or also allow the user to cancel intro generation if it's still loading?
- Is there a maximum acceptable wait time for intro generation before we auto-skip and resume music?
- Should we pre-generate intros for the next track in the queue for power users, or is on-demand generation sufficient for MVP?
- How should we handle credit exhaustion mid-playlist (auto-disable intros, prompt user, etc.)? 