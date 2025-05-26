# 🎵 User Story: Template Selection in Now Playing

## Overview
As a user, I want to select and apply different intro templates while listening to music, so that I can get varied perspectives and information about each track. I want to be able to switch templates on the fly and have them immediately applied to the current track's intro.

## User Journey
1. User opens the Now Playing page
2. User sees the currently playing track and its intro
3. User can select a different template from a dropdown
4. User can regenerate the intro using the selected template
5. User can see which template is currently active
6. User can quickly switch between templates without leaving the Now Playing page

## Technical Implementation
- Integrate template selection UI with Now Playing page
- Modify intro generation to use selected template
- Add template switching functionality
- Implement template persistence
- Add loading states and error handling
- Ensure real-time updates

## Acceptance Criteria
- [ ] Template selector is visible on Now Playing page
- [ ] User can select from available templates
- [ ] Selected template is used for intro generation
- [ ] Template selection persists across sessions
- [ ] Intro regenerates when template changes
- [ ] Loading states show during regeneration
- [ ] Error handling for failed template application
- [ ] Clear feedback when template is changed

## Success Metrics
- Template switching frequency
- Intro regeneration success rate
- User satisfaction with template variety
- Error rate in template switching

## Implementation Plan

### Phase 1: Analysis & Design
- [ ] Review current Now Playing page implementation
  - [ ] Analyze intro generation flow
  - [ ] Identify integration points
  - [ ] Document state management
- [ ] Review template system implementation
  - [ ] Analyze template data structure
  - [ ] Review template selection logic
  - [ ] Document template persistence
- [ ] Design template selector UI
  - [ ] Create mockups
  - [ ] Define component structure
  - [ ] Plan state management

### Phase 2: Core Integration
- [ ] Add template selector component
  - [ ] Create dropdown interface
  - [ ] Add template list loading
  - [ ] Implement selection handling
- [ ] Modify intro generation
  - [ ] Update intro generation to use selected template
  - [ ] Add template switching logic
  - [ ] Implement regeneration flow
- [ ] Add template persistence
  - [ ] Store selected template in user preferences
  - [ ] Load saved template on page load
  - [ ] Handle template updates

### Phase 3: UI/UX Enhancement
- [ ] Add loading states
  - [ ] Show loading during template switch
  - [ ] Add regeneration progress indicator
  - [ ] Implement smooth transitions
- [ ] Add error handling
  - [ ] Handle template loading errors
  - [ ] Handle regeneration failures
  - [ ] Add retry mechanisms
- [ ] Improve user feedback
  - [ ] Add success/error notifications
  - [ ] Show current template status
  - [ ] Add template preview

### Phase 4: Testing & Polish
- [ ] Add unit tests
  - [ ] Test template selection
  - [ ] Test intro regeneration
  - [ ] Test error handling
- [ ] Add integration tests
  - [ ] Test full template switching flow
  - [ ] Test persistence
  - [ ] Test error recovery
- [ ] Polish UI/UX
  - [ ] Add animations
  - [ ] Improve accessibility
  - [ ] Add keyboard navigation

## Technical Approach
```typescript
// Template selection state
interface TemplateSelectionState {
  selectedTemplateId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Template selection hook
const useTemplateSelection = () => {
  const [state, setState] = useState<TemplateSelectionState>({
    selectedTemplateId: null,
    isLoading: false,
    error: null
  });

  const selectTemplate = async (templateId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Update selected template
      await updateUserTemplatePreference(templateId);
      // Regenerate intro with new template
      await regenerateIntro(templateId);
      setState(prev => ({ ...prev, selectedTemplateId: templateId, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
    }
  };

  return { ...state, selectTemplate };
};

// Template selector component
const TemplateSelector = () => {
  const { templates, loading } = usePromptTemplates();
  const { selectedTemplateId, selectTemplate } = useTemplateSelection();

  return (
    <select 
      value={selectedTemplateId || ''} 
      onChange={(e) => selectTemplate(e.target.value)}
      disabled={loading}
    >
      <option value="">Select a template</option>
      {templates.map(template => (
        <option key={template.id} value={template.id}>
          {template.name}
        </option>
      ))}
    </select>
  );
};
```

## Notes
- Consider caching generated intros per template
- Add analytics for template usage
- Consider adding template preview
- Plan for template versioning
- Consider adding template categories

## Spikes
1. Review current intro generation flow in `app/playing/page.tsx`
   - How is the default prompt currently used?
   - Where is the intro generation triggered?
   - How is the intro state managed?

2. Analyze template system in `app/templates/page.tsx`
   - How are templates loaded and managed?
   - What is the template selection flow?
   - How is template persistence handled?

3. Review Firestore schema
   - How are templates stored?
   - How are user preferences stored?
   - What changes are needed for template selection?

4. Investigate state management
   - How is the Now Playing state managed?
   - How can template selection be integrated?
   - What changes are needed for real-time updates?
