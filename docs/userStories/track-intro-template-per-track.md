# 🎵 User Story: Track Intro Templates Are Track-Specific

## Overview

As a user, I want each track intro to be generated and stored based on the specific template I choose, so that I can have different types of intros for each track and easily switch between them. There should be no global or user-level 'last used template'—all template associations are per track.

## User Journey

1. User opens the Now Playing page and sees the currently playing track.
2. User selects a template (e.g., "Historical Facts" or "Podcast Summary") from the template selector.
3. User generates an intro for the current track using the selected template.
4. The generated intro is saved and associated with both the track and the template used.
5. When the user switches templates, the app checks if an intro for that track+template exists:
   - If yes, it loads the cached intro.
   - If not, it generates a new intro and saves it for that track+template.
6. When the user switches tracks, the app shows available intros for that track, by template.
7. The user can create new templates and use them for any track.

## Technical Implementation

- Remove any logic for saving or loading a 'last used template' at the user level. **(Complete)**
- Ensure the `TrackIntro` model always includes `templateId` and `templateName`.
- When generating an intro, always save it with the track ID and template ID.
- When loading intros for a track, fetch all intros for that track (for the user), grouped by template.
- The UI only manages template selection and intro generation at the track level.
- No user-level template state is persisted (other than the user's list of templates).

## Acceptance Criteria

- [x] User can select a template and generate an intro for the current track.
- [x] Each generated intro is saved with both the track ID and template ID.
- [x] When switching templates, the app loads the intro for that track+template if it exists, or generates a new one.
- [x] When switching tracks, the app shows available intros for that track, by template.
- [x] No 'last used template' or 'default prompt' is saved at the user level.
- [x] User can create, edit, and delete templates, and use them for any track.
- [x] All Firestore and API logic is track+template based.
- [x] UI/UX is clear that template selection is per track.

## Success Metrics

- Number of intros generated per template per track
- User engagement with template switching
- Error rate in intro generation
- User satisfaction with template flexibility

## Implementation Plan

### Phase 1: Analysis & Design

- [x] Review current Now Playing and template system implementation
- [x] Identify and remove any user-level template state
- [x] Document new data flow: track+template → intro

**Phase 1 Complete:** The codebase no longer contains any user-level template state. All template associations are now per track.

### Phase 2: Core Integration

- [x] Update Firestore functions to remove user-level template state (Complete)
- [x] Ensure all intro save/load operations are track+template based
- [x] Update Now Playing page to only manage template selection per track
- [x] Update API to always save template info with intros (Complete)

**Note:** The codebase now uses `trackId+templateId` for all intro operations. No user-level template state remains. The Now Playing page, Firestore functions, and API are fully track+template scoped.

### Phase 3: UI/UX Enhancement

- [x] Ensure template selector is per track
- [x] Add clear feedback for intro generation and switching
- [x] Show all available intros for a track, grouped by template (selector now visually indicates available intros per template)
- [x] Remove any UI for user-level template state

**Note:** The UI is now minimal, mobile-first, with the Spotify player at the top and template/intro controls below. All requirements are met.

## Implementation Details

1. **TrackIntro Model**

   - Must include `trackId`, `templateId`, and `templateName`.
   - All intros are saved under the user's `trackIntros` subcollection, keyed by track+template.

2. **Database Operations**

   - Remove `getLastUsedTemplate` and `updateLastUsedTemplate` functions. **(Complete)**
   - All intro fetch/save operations are scoped to track+template.

3. **Now Playing Page**

   - On track change, load all intros for that track.
   - On template change, load or generate intro for that track+template.
   - No persistence of template selection at the user level.

4. **Template Management**
   - User can create, edit, and delete templates.
   - Templates are available for use on any track.

## Notes

- This approach maximizes flexibility and clarity for users.
- It simplifies state management and avoids confusion about 'default' or 'last used' templates.
- Future enhancements could include analytics on template usage per track.

## Status: ✅ Complete

This user story is complete. The Now Playing page and intro system are fully track+template scoped, minimal, and mobile-first.
