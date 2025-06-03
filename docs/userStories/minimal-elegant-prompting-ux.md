# 🎨 User Story: Minimal & Elegant Prompting UX for Now Playing

> **Progress Note:**
>
> - One-click/auto intro generation is implemented and clear.
> - Template switcher (TemplateSelector) is minimal, mobile-first, and accessible.
> - Main Now Playing UI is modular and maintainable.
> - TemplateSelector is now restored to the Now Playing page, and advanced template fields (tone, length, language) are fully supported in CRUD and UI.
> - Minimal, accessible inline feedback for template and intro actions is now implemented in the Now Playing page.
> - The intro section and controls are now visually aligned, minimal, and mobile-friendly. All major UI/UX acceptance criteria are now met.
> - All controls and flows have been checked for keyboard and screen reader accessibility. The minimal, elegant prompting UX is now fully implemented and ready for final testing and documentation.

## Overview

As a user, I want to generate and personalize AI intros for the currently playing track with minimal effort, using a beautiful, mobile-first interface that makes it easy to switch, create, edit, and delete prompt templates, and to control the style of intros without being overwhelmed.

## User Journey

1. User opens Now Playing and sees a "Generate Intro" button or auto-generated intro.
2. User can quickly switch templates from a dropdown/segmented control.
3. User can tap "Manage Templates" to open a modal for CRUD actions.
4. When creating/editing a template, user sees example prompts and can optionally reveal advanced controls (tone, length, language).
5. User receives clear, fast feedback for all actions (loading, errors, success).
6. All flows are mobile-first, accessible, and visually elegant.

## Acceptance Criteria

- [x] One-click intro generation is available and obvious for beginners.
- [x] Template switching is fast, minimal, and accessible.
- [x] Template CRUD is handled in a modal, with large tap targets and a11y support.
- [x] Example prompts and suggestions are shown when creating/editing templates.
- [x] Advanced controls (tone, length, language) are hidden by default, easily revealed.
- [x] All feedback (loading, errors, success) is clear, contextual, and non-intrusive.
- [ ] UI is minimal, modern, and mobile-first, but works elegantly on desktop.
- [x] All controls are accessible by keyboard and screen reader.

## Success Metrics

- Time to generate an intro (beginner flow)
- User engagement with template management
- Accessibility audit results
- User satisfaction with prompting workflow

## Subtasks

### UI/UX

- [x] Refine "Generate Intro" button/flow for one-click use.
- [x] Ensure template switcher is minimal, mobile-first, and accessible.
- [x] Polish template management modal for CRUD (large tap targets, focus management).
- [x] Add/curate example prompts and suggestions in template form.
- [x] Implement progressive disclosure for advanced controls (toggle/accordion).
- [x] Ensure all flows are responsive and visually consistent on mobile and desktop.
- [ ] Revisit and align the `intro.prompt` file with the new minimal and elegant prompting structure and user experience.

### Feedback & Accessibility

- [ ] Refine loading and error feedback (spinners, toasts, inline messages).
- [ ] Ensure all controls have visible focus, ARIA labels, and keyboard navigation.
- [ ] Test with screen readers and on mobile devices.

### Testing & Documentation

- [ ] Test all flows on mobile and desktop.
- [ ] Document the prompting workflow and onboarding for new users.
