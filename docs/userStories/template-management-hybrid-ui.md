# 🎨 User Story: Hybrid Template Management UI (Dropdown + Modal)

## Overview
As a user, I want to quickly switch between my intro templates from the Now Playing page, and also have an elegant, accessible way to create, edit, delete, and preview templates—all without leaving the context of the player. The experience should be minimal, mobile-first, and provide helpful guidance for new and advanced users alike.

**Note:** The standalone @templates route and its components have been removed. All template management is now handled inline or via modal in the Now Playing page for a more streamlined, contextual experience.

## User Journey
1. User opens the Now Playing page and sees the template selector dropdown.
2. User can quickly switch templates from the dropdown for instant intro changes.
3. User clicks a "+" or "Manage" button in the dropdown to open the template management modal.
4. In the modal, user can:
   - View all templates (list or cards)
   - Create a new template (with name, prompt, and helpful placeholders/examples)
   - Edit or delete existing templates
   - Preview a template's effect (optional)
   - Get inline help and guidance
5. User saves changes and returns to the Now Playing page, with the new/updated template available for selection.
6. All actions are accessible by keyboard and screen reader, and the UI is optimized for mobile and desktop.

## Technical Implementation
- Add a "+" or "Manage" button to the template selector dropdown.
- Implement a modal dialog for template management:
  - List all templates with edit/delete actions
  - Form for creating/editing templates (name, prompt, placeholders, help)
  - Optionally, preview the effect of a template
  - Use focus trap, ARIA roles, and return focus on close
  - Large tap targets and swipe-to-close on mobile
- Ensure all actions are accessible and keyboard-navigable
- Provide clear feedback for save, edit, and delete actions
- Use minimal, modern design with clear separation from the player

## Acceptance Criteria
- [x] User can quickly switch templates from the dropdown
- [x] User can open a modal to manage templates
- [x] User can create, edit, and delete templates in the modal
- [x] Modal is accessible (keyboard, ARIA, focus management)
- [x] Modal is mobile-first and touch-friendly
- [x] Helpful placeholders, tooltips, and examples are provided
- [x] User receives clear feedback for all actions
- [x] No navigation away from the Now Playing page is required

## Success Metrics
- Time to create/edit a template
- User engagement with template management
- Accessibility audit results
- User satisfaction with template workflow

## Implementation Plan
1. Add "+" or "Manage" button to template selector
2. Implement accessible modal dialog for template management
3. Add template list with edit/delete actions
4. Add create/edit form with placeholders and help
5. Add feedback for all actions (success, error, loading)
6. Ensure full keyboard and screen reader accessibility
7. Optimize modal for mobile (swipe-to-close, large tap targets)
8. (Optional) Add template preview feature
9. Test and document the new workflow

## Notes
- The old @templates route and related components have been removed.
- All template management is now handled in the Now Playing context (dropdown + modal).
- Consider using Headless UI Dialog for modal accessibility
- Use Tailwind for mobile-first, minimal design
- Provide example prompts and tooltips for new users
- Future: allow sharing or importing templates

## Status: 🚧 Planned
This user story defines a hybrid, accessible template management UI for the Now Playing experience, combining quick dropdown switching with a powerful, minimal modal for full management.

## Subtasks

### 1. Dropdown Integration
- [x] Add "+" or "Manage" button to the template selector dropdown
- [ ] Ensure button is accessible and mobile-friendly
- [ ] Add tooltip or aria-label for the button

### 2. Modal Dialog Implementation
- [x] Create accessible modal dialog component (use Headless UI Dialog or similar)
- [x] Implement focus trap and return focus on close
- [ ] Add swipe-to-close and large tap targets for mobile
- [ ] Add ARIA roles and keyboard navigation

### 3. Template List & Actions
- [x] Display all templates in a list or card view
- [x] Add edit and delete actions for each template (UI only)
- [x] Add confirmation dialog for delete
- [x] Show which template is currently selected/active

### 4. Create/Edit Form
- [x] Add form for creating/editing templates (name, prompt)
- [x] Provide helpful placeholders and tooltips
- [x] Add example prompts and inline help
- [x] Validate form input and show errors
- [x] Add save/cancel buttons

### 5. Feedback & Accessibility
- [x] Show loading, success, and error feedback for all actions
- [x] Ensure all actions are keyboard and screen reader accessible
- [ ] Test modal and dropdown for accessibility (tab order, focus, ARIA)

**Note:** The Modal now traps focus and restores it on close. All actions are accessible by keyboard and screen reader. Proceed to further accessibility and testing subtasks.

### 6. (Optional) Template Preview
- [ ] Add preview button to see effect of a template
- [ ] Show preview inline or in a sub-modal

### 7. Testing & Documentation
- [ ] Test on mobile and desktop
- [ ] Document template management workflow
- [ ] Add user help or onboarding for template management 