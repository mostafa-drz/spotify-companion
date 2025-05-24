# 🎵 User Story: Customizable Track Intro Templates

## Overview
As a user, I want to customize how track intros are generated, so that I can receive personalized and relevant information about each track I listen to. I want to be able to save and reuse my preferred intro styles, and have them automatically applied to new tracks while maintaining the ability to customize individual track intros.

## User Journey
1. User opens the app and navigates to the templates section
2. User sees a list of system templates and their own custom templates
3. User can select a template to use for generating track intros
4. User can create, edit, and delete their own templates
5. User can set a default template for all new tracks

## Technical Implementation
- Store templates in Firestore
- Use Firebase Authentication for user management
- Implement client-side state management with React hooks
- Add toast notifications for user feedback
- Implement error handling and loading states
- Use TypeScript for type safety and better developer experience

## Acceptance Criteria
- [x] Users can view system templates
- [x] Users can create custom templates
- [x] Users can edit their templates
- [x] Users can delete their templates
- [x] Users can set a default template
- [x] Templates are persisted in Firestore
- [x] User feedback through toast notifications
- [x] Error handling and loading states
- [ ] Templates are used in track intro generation

## Success Metrics
- Number of custom templates created per user
- Template usage frequency
- User satisfaction with generated intros
- Error rate in template operations

## Implementation Plan

### Phase 1: Data Structure & Client-Side Operations ✅
- [x] Update Firebase schema
  - [x] Create `promptTemplates` collection
  - [x] Add user prompt settings to user documents
- [x] Implement client-side state management
  - [x] Create `usePromptTemplates` hook
  - [x] Add CRUD operations
  - [x] Add error handling
  - [x] Add loading states
  - [x] Add toast notifications
- [x] Create server components
  - [x] Implement template loading
  - [x] Add server-side data fetching
- [x] Organize TypeScript types
  - [x] Consolidate prompt-related types
  - [x] Add proper type definitions
  - [x] Ensure type safety

### Phase 2: UI Components ✅
- [x] Create template selector
  - [x] Add dropdown interface
  - [x] Show system and user templates
  - [x] Add create new option
- [x] Create template preview
  - [x] Show template details
  - [x] Add use/edit/delete actions
  - [x] Add expand/collapse functionality
- [x] Create template form
  - [x] Add name and prompt fields
  - [x] Add validation
  - [x] Add submit/cancel actions

### Phase 3: Integration & Flow ✅
- [x] Implement default prompt handling
  - [x] Add default prompt state
  - [x] Add set/clear default actions
  - [x] Add persistence
- [x] Update track intro generation
  - [x] Use selected template
  - [x] Add fallback to default
  - [x] Add error handling

### Phase 4: Polish & Error Handling ✅
- [x] Add loading states
  - [x] Add loading indicators for template operations
    - [x] Add spinner for template creation/update/delete
    - [x] Add loading state for default prompt setting
    - [x] Add loading state for template list refresh
  - [x] Add skeleton loaders for template list
    - [x] Create skeleton component for template cards
    - [x] Add shimmer effect for better UX
    - [x] Handle empty state gracefully
  - [x] Add loading states for form submissions
    - [x] Disable form during submission
    - [x] Show loading state on submit button
    - [x] Prevent multiple submissions
- [x] Add error boundaries
  - [x] Create error boundary component
  - [x] Add fallback UI for errors
  - [x] Add error recovery options
- [x] Improve user feedback
  - [x] Add success/error animations
  - [x] Add confirmation dialogs for destructive actions
  - [x] Add tooltips for better UX

## Next Steps
All required phases have been completed. The template system is now ready for use in track intro generation.

## Technical Approach
```typescript
// Type definitions
interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  userId?: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserPromptSettings {
  defaultPrompt: string | null;
  templates: string[];
}

// Client-side operations with toast notifications
const { templates, loading, error, defaultPrompt, createTemplate, updateTemplate, deleteTemplate, setDefaultPrompt } = usePromptTemplates();

// Example usage
try {
  await createTemplate({
    name: 'My Template',
    prompt: 'Generate an intro for {track} by {artist}',
  });
  toast.success('Template created successfully');
} catch (error) {
  toast.error('Failed to create template');
}

// Server components for data fetching
async function getSystemTemplates() {
  const templates = await adminDb
    .collection('promptTemplates')
    .where('isSystem', '==', true)
    .get();
  return templates.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

## Notes
- No analytics tracking required
- No rate limiting needed
- No validation requirements for now
- No migration needed for existing data
- TypeScript types are consolidated in `app/types/Prompt.ts`
