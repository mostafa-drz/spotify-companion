# Template-Based Intro Caching

## User Story

As a music enthusiast, I want to be able to switch between different AI-generated intros for the same track based on different templates, so that I can explore and compare different perspectives on the music I'm listening to without waiting for regeneration.

## Business Value

- Reduces API costs by caching intros per template/track combination
- Increases user engagement by encouraging exploration of different perspectives
- Enhances user experience by providing instant access to previously generated intros
- Creates potential for premium features around intro history and comparison

## Technical Implementation

### Data Model Changes

- Update Firestore schema to store intros with template context
- Add template identifier to intro cache key
- Migrate existing intros to default template

### Backend Changes

- Modify intro generation endpoint to accept template context
- Update caching logic to consider template in cache key
- Add migration script for existing intros

### Frontend Changes

- Update UI to show template context with intros
- Add template switching with instant intro loading
- Implement intro history view (optional)
- Add visual indicators for cached vs. newly generated intros

## Acceptance Criteria

1. When a user switches templates for a track:
   - If an intro exists for that template/track combination, it loads instantly
   - If no intro exists, a new one is generated and cached
2. Users can see which template was used to generate each intro
3. The regenerate button is always available to get a fresh intro for the current template
4. All intros are properly cached and retrievable
5. The UI clearly indicates when an intro is loaded from cache vs. newly generated

## Subtasks

### 1. Data Model Updates

- [ ] Design and document new Firestore schema for template-based intros
- [ ] Create migration plan for existing intros
- [ ] Implement schema changes in Firestore
- [ ] Write and test migration script

### 2. Backend Implementation

- [ ] Update intro generation API to handle template context
- [ ] Modify caching logic to include template in cache key
- [ ] Add template validation and error handling
- [ ] Implement migration endpoint for existing intros
- [ ] Add tests for new template-based caching

### 3. Frontend Template Integration

- [ ] Update template selector to handle cached intros
- [ ] Add template context to intro display
- [ ] Implement instant loading of cached intros
- [ ] Add loading states for new intro generation
- [ ] Update regenerate button to work with templates

### 4. UI/UX Improvements

- [ ] Design and implement template switching UI
- [ ] Add visual indicators for cached vs. new intros
- [ ] Create template context display
- [ ] Implement smooth transitions between templates
- [ ] Add keyboard navigation support

### 5. Testing & Quality Assurance

- [ ] Write unit tests for new template-based caching
- [ ] Test migration of existing intros
- [ ] Verify cache behavior with different templates
- [ ] Test edge cases (no template, invalid template, etc.)
- [ ] Perform accessibility testing

### 6. Documentation & Deployment

- [ ] Update API documentation
- [ ] Document new template-based caching feature
- [ ] Create user guide for template switching
- [ ] Plan and execute deployment strategy
- [ ] Monitor performance and usage after deployment

## Notes

- Consider adding a "favorite" or "pin" feature for preferred intros
- Explore adding a history view to compare different template intros
- Consider adding template categories or tags for better organization
- Monitor storage usage as number of cached intros grows
- Consider adding a cleanup policy for unused cached intros

## Dependencies

- Existing template system
- Current intro generation system
- Firestore database
- Frontend state management

## Estimation

- Data Model Updates: 2 days
- Backend Implementation: 3 days
- Frontend Template Integration: 3 days
- UI/UX Improvements: 2 days
- Testing & Quality Assurance: 2 days
- Documentation & Deployment: 1 day

Total: 13 days
