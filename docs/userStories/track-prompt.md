# Default Track Prompt — User Story & Implementation Plan

## User Story

As a user, I want to set a default prompt for AI-generated track intros, so that I can receive personalized and relevant information about each track I listen to, without having to re-enter my preferences every time. I want to be able to update this prompt at any time, and have it persist for all future tracks until I change it again.

### Acceptance Criteria

- The default prompt is shown and editable in the now playing/intro section.
- When I update the prompt, it is saved to my user profile and used for all upcoming tracks.
- The prompt persists across sessions and devices.
- I can regenerate the AI intro for the current track using the current prompt.
- The system provides feedback when the prompt is saved or used to generate a new intro.

## Implementation Plan

1. **Prompt Data Model & Persistence**

   - [x] Add a `defaultTrackPrompt` field to the user table/model.
   - [x] Ensure prompt changes are saved and persist across sessions.

2. **Backend/Prompt Retrieval & Update**

   - [x] Fetch the user's default prompt when loading a track.
   - [x] Provide an API endpoint or mutation to update the user's default prompt. _(not needed, handled client-side)_

3. **Frontend UI: Display & Edit Prompt**

   - [x] Show the current default prompt in the now playing/intro section.
   - [x] Allow the user to edit and save the prompt.

4. **Regenerate Intro with Custom Prompt**

   - [ ] Add a button to regenerate the AI intro using the current prompt.
   - [ ] Display the new intro after regeneration.

5. **UX & Validation**

   - [ ] Validate prompt length/content.
   - [ ] Provide feedback for successful/failed regeneration and prompt save.

6. **Testing & Polish**
   - [ ] Test prompt persistence and regeneration.
   - [ ] Polish UI/UX for clarity and accessibility.

## Success Criteria

- The default prompt is easy to find, edit, and persists for the user.
- AI intros are generated using the latest saved prompt.
- The feature works seamlessly across sessions and devices.
- Users receive clear feedback for all actions.
