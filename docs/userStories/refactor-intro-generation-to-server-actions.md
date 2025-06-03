# 🎯 User Story: Refactor Intro Generation to Decoupled Server Actions (Text & TTS)

## Overview
As a developer,
I want to move intro text and audio (TTS) generation from the API route to two decoupled Next.js Server Actions,
so that the codebase is more idiomatic, maintainable, and flexible for future enhancements.

---

## Background & Motivation
- The current `/api/intro` route handles both text (GenAI) and TTS audio generation in a single endpoint.
- This tightly coupled approach makes it harder to test, maintain, and extend (e.g., retry TTS only, or support new AI models).
- Next.js Server Actions are now the recommended way to handle UI-driven mutations and data flows.
- Caching logic is better handled on the frontend, using SWR or similar hooks, for transparency and flexibility.

---

## Clarifying Answers
1. **Should TTS audio generation always happen immediately after text generation, or should it be a separate, user-triggered step?**
   - It should be a separate action; we want to decouple them.
2. **Should we support retrying TTS generation independently from text generation?**
   - Yes, this is enabled by decoupling.
3. **Should credit deduction happen only for new text generations, or also for TTS retries?**
   - Credit deduction happens for both text and TTS generations.
4. **Are there any analytics or logging requirements for intro/TTS generation attempts and failures?**
   - Not for now.
5. **Should we keep any legacy API route for backward compatibility, or fully migrate to Server Actions?**
   - No, fully migrate.

---

## Acceptance Criteria
- [ ] Intro text generation is handled by a Server Action (`generateIntroText`).
- [ ] TTS audio generation is handled by a separate Server Action (`generateIntroAudio`).
- [ ] The frontend checks Firestore for cached intros before calling the actions.
- [ ] The Server Actions only generate and save new intros/audio; they do not check for cache.
- [ ] Credit deduction happens for both text and TTS generations.
- [ ] The UI can handle errors and retries for both text and TTS generation independently.
- [ ] All legacy API route code is removed.

---

## Subtasks

### Spike & Review
- [x] Review all current usages of `/api/intro` and related hooks/components.
- [x] Review how caching, credit deduction, and Firestore writes are currently handled.
- [x] Review TTS integration and error handling.

### Server Action Implementation
- [x] Create a new Server Action file (e.g., `app/actions/ai.ts`).
- [x] Implement `generateIntroText` (GenAI only, with credit deduction and Firestore write).
- [x] Implement `generateIntroAudio` (TTS only, with credit deduction and Firestore write).

### Frontend Refactor
- [x] Update frontend to check Firestore for cached intros/audio before calling the actions.
- [x] Update SWR hooks and UI to use the new Server Actions.
- [x] Add UI for retrying TTS generation independently.
- [x] Remove all fetches to `/api/intro`.

### Cleanup
- [x] Remove the `/api/intro` API route and related backend cache logic.
- [x] Remove any now-unused types, helpers, or legacy code.

### Testing & Validation
- [ ] Test the full flow: intro text generation, TTS, caching, error handling, and retries.
- [ ] Validate credit deduction and Firestore writes.
- [ ] Update documentation and user stories as needed.

---

## Notes
- This refactor will make it easier to add new AI models, support advanced retry flows, and keep the codebase idiomatic for Next.js 14+.
- See also:
  - `intro-generation-changes.md`
  - `migrate-to-dotprompt.md`
  - `template-based-intro-caching.md` 