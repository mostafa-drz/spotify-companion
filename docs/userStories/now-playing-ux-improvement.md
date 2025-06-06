# 🎵 User Story: Now Playing UI/UX Improvement

## Overview

As a user, I want the Now Playing page to be visually appealing, easy to use, and consistent with the rest of the app, so that I can enjoy a seamless and delightful experience while listening to music and exploring AI-generated intros.

This user story builds on the template selection feature described in [integrate-selected-template-with-intro.md](./integrate-selected-template-with-intro.md), focusing on elevating the overall user experience.

## User Journey

1. User opens the Now Playing page
2. User sees a clean, well-organized layout with clear sections
3. User can easily identify the current track, template, and intro
4. User interacts with controls (playback, regenerate, template selection) with clear feedback
5. User enjoys a responsive and accessible interface on all devices

## Goals

- Improve visual hierarchy and spacing
- Enhance typography and readability
- Ensure color and contrast accessibility
- Achieve component and interaction consistency
- Modernize controls and selectors
- Provide clear feedback and status indicators
- Ensure responsiveness and accessibility
- Add microinteractions for delight

## Technical Implementation

- Refactor layout for better spacing and section separation
- Use consistent typography and font sizes for headings, track info, and intro
- Apply a custom-styled dropdown for template selection (reuse or extend TemplateSelector)
- Style the "Enable AI Intros" toggle as a modern switch
- Use consistent button styles and icon buttons for audio controls
- Add loading indicators and toasts for actions (e.g., saving, regenerating)
- Ensure all elements are keyboard accessible and have ARIA labels
- Add subtle hover/focus/transition effects
- Test and optimize for mobile and tablet

## Acceptance Criteria

- [ ] Major sections are visually distinct and well-spaced
- [ ] Track info, template selector, and intro are easy to read
- [ ] All controls use consistent styles and provide clear feedback
- [ ] Template selector uses a custom dropdown with preview/description
- [ ] Audio controls use icon buttons and are grouped with the player
- [ ] Loading and error states are clearly indicated
- [ ] The page is fully responsive and accessible
- [ ] Microinteractions (hover, focus, transitions) are present

## Prioritized Suggestions

1. Use a custom-styled dropdown for the template selector
2. Increase spacing between sections and use consistent padding
3. Make the "Enable AI Intros" a modern switch
4. Use icon buttons for Play/Replay/Pause and group with the audio player
5. Add loading indicators for intro generation and actions
6. Add toasts for success/error feedback
7. Improve typography for track title, artist, and intro
8. Ensure color contrast and dark mode support
9. Add subtle hover/focus/transition effects
10. Test and optimize for mobile and accessibility

---

## Subtasks

- [x] Refactor TemplateSelector to use a custom-styled dropdown with preview/description
- [x] Adjust layout and add spacing between all major sections (prompt, selector, track info, intro, controls)
- [x] Replace the "Enable AI Intros" checkbox with a modern switch component
- [x] Refactor audio controls to use icon buttons and group them with the audio player
  - Hide the native audio player
  - Use only custom icon buttons for Play, Replay, Pause, and Regenerate (with tooltips/aria-labels)
  - Add a minimal custom progress bar below the intro or above the controls
  - Group all controls in a single, compact row with subtle background/border
  - Ensure all controls are accessible and keyboard navigable
  - Regenerate Intro button is now above the intro, uses a refresh icon, and is visually separated from audio controls for clarity
  - All icon buttons have tooltips for accessibility and user guidance
- [x] Add loading spinners/progress indicators for intro generation and actions
  - Spinners are shown on the Regenerate button and in the intro area during generation
  - Spinners use theme-consistent green color and accessible markup
- [x] Implement inline feedback for success and error states
  - All feedback is now shown inline, below the relevant section, using theme-consistent colors and accessible roles
- [x] Update typography for track title, artist, and intro for better readability
  - Track title, artist, album, and intro now use improved font sizes, weights, and spacing for better readability and hierarchy
- [x] Audit and improve color contrast, especially for dark mode
  - All text and UI elements now use accessible, high-contrast colors for both light and dark mode, ensuring readability and WCAG compliance
- [x] Add hover, focus, and transition effects to interactive elements
  - All interactive elements now have clear, accessible hover, focus, and transition effects in both light and dark mode
- [x] Test and optimize the layout for mobile and tablet devices
  - Layout, spacing, and controls are now responsive and touch-friendly on all devices
- [x] Ensure all controls are keyboard accessible and have ARIA labels
  - All controls are now fully keyboard accessible and have appropriate ARIA labels for screen readers

---

This user story should be implemented after or in parallel with the template selection integration ([integrate-selected-template-with-intro.md](./integrate-selected-template-with-intro.md)).

## Status: 🚧 In Progress
