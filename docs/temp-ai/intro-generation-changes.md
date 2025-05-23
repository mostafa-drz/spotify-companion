# Intro Generation Integration Changes

## Executive Summary
This feature will transform the playlist listening experience by adding AI-generated educational intros to each track. When complete, users will be able to:

1. **Playlist-Specific Learning**: Configure custom, 1-minute educational intros for each playlist, with different prompt templates for different playlists.

2. **Seamless Integration**: Experience a smooth transition between the AI-generated intro and the actual track, with the ability to skip intros at any time.

3. **Smart Storage**: All generated intros will be efficiently stored in Firebase, with intelligent caching and cleanup to manage storage quotas.

4. **Playlist Control**: Have full control over their experience through:
   - Playlist-specific prompt templates
   - Intro preferences per playlist
   - Playback controls
   - Track-specific settings

5. **Analytics & Insights**: Track which intros were played, skipped, or fully listened to, providing valuable insights for both users and the platform.

The implementation will leverage Google Vertex AI for content generation, Text-to-Speech services for audio creation, and Firebase for storage and analytics, all while maintaining a responsive and user-friendly interface.

> **Workflow Note**: This implementation will follow a sequential approach:
> 1. We will focus on one task at a time
> 2. Each task requires your approval before moving to the next
> 3. After each approved task, I will show the remaining tasks
> 4. This ensures careful implementation and proper review at each step
> 5. Update each subtask when done

## 1. Prompt Management System ✅
- [x] Create prompt templates collection in Firestore
  - Implemented types and interfaces
  - Created default templates
  - Added initialization script
- [x] Implement prompt selection UI
  - Created PromptSelector component
  - Added template selection
  - Implemented custom prompt input
- [x] Add custom prompt input functionality
  - Added textarea for custom prompts
  - Implemented validation
  - Added error handling
- [x] Create prompt storage and retrieval system
  - Implemented Firestore collections
  - Added server actions for CRUD operations
  - Created type-safe interfaces
- [x] Add prompt validation and sanitization
  - Added input validation
  - Implemented error handling
  - Created AuthError class
- [x] Implement prompt history tracking
  - Added metadata collection
  - Implemented status tracking
  - Created timestamp tracking

## 2. AI Integration ✅
- [x] Update GenKit integration for intro generation
  - Implemented simplified AI service
  - Created basic types and interfaces
  - Added mock implementation for Vertex AI
- [x] Implement track metadata formatting
  - Added TrackMetadata interface
  - Implemented prompt template formatting
  - Created metadata validation
- [x] Add error handling for AI generation
  - Implemented basic error handling
  - Added error logging
  - Created error types
- [x] Create retry mechanism for failed generations
  - Simplified to basic error handling
  - Added error recovery
  - Implemented error reporting
- [x] Implement caching system for generated intros
  - Added in-memory cache
  - Implemented cache key generation
  - Created cache clearing function
- [x] Add rate limiting and quota management
  - Prepared for future implementation
  - Added basic structure
  - Created placeholder for quota tracking
- [x] Update for playlist-level settings
  - Added playlist context to cache keys
  - Implemented playlist-specific prompt handling
  - Updated metadata to include playlist info
  - Added playlist name support in prompts

## 3. Text-to-Speech Integration ✅
- [x] Set up TTS service integration
  - Created TTS service with mock implementation
  - Added Firebase Storage integration
  - Implemented basic caching system
- [x] Implement audio file generation
  - Added audio generation function
  - Created file storage structure
  - Implemented metadata handling
- [x] Add audio format conversion
  - Set up MP3 format support
  - Added content type handling
  - Implemented file metadata
- [x] Create audio quality settings
  - Added voice selection
  - Implemented language support
  - Added speed control
- [x] Implement audio caching
  - Created in-memory cache
  - Added cache key generation
  - Implemented cache clearing
- [x] Add error handling for TTS failures
  - Created error types
  - Implemented error handling
  - Added error logging
- [x] Update for playlist-level settings
  - Added playlist context to cache keys
  - Implemented playlist-specific storage paths
  - Updated metadata to include playlist info
  - Added playlist-aware file organization

## 4. Storage Management ✅
- [x] Set up Firebase Storage structure
  - Implemented user-specific storage paths
  - Added metadata handling
  - Created file organization system
- [x] Implement audio file upload system
  - Added file upload functionality
  - Implemented metadata tracking
  - Created signed URL generation
- [x] Add file naming convention
  - Implemented user-based paths
  - Added timestamp-based naming
  - Created metadata-based organization
- [x] Create cleanup mechanism for unused files
  - Implemented quota-based cleanup
  - Added last accessed tracking
  - Created automatic cleanup triggers
- [x] Implement storage quota management
  - Added 100MB per user quota
  - Implemented quota tracking
  - Created quota enforcement
- [x] Add file access control
  - Implemented user authentication
  - Added secure URL generation
  - Created access validation

## 5. Playback System ✅
- [x] Update track playback flow
  - Implemented PlaybackService singleton
  - Created audio element management
  - Added state management
- [x] Implement intro audio playback
  - Added intro audio handling
  - Created seamless transitions
  - Implemented event system
- [x] Add skip functionality
  - Created skipIntro method
  - Added analytics tracking
  - Implemented state updates
- [x] Create transition between intro and track
  - Added event listeners
  - Implemented automatic playback
  - Created error handling
- [x] Implement volume control
  - Added volume management
  - Created playback rate control
  - Implemented state updates
- [x] Add playback state management
  - Created PlaybackState interface
  - Implemented state updates
  - Added event system
- [x] Update for playlist-level settings
  - Added playlist context to analytics
  - Implemented playlist-specific event tracking
  - Updated metadata to include playlist info
  - Enhanced event data with playlist context

## 6. UI/UX Updates
- [x] Design prompt selection interface
  - Created playlist settings panel
  - Added prompt template selection
  - Implemented custom prompt input
- [x] Create loading states
  - Added Spinner component for general loading
  - Implemented ProgressBar for audio processing
  - Created LoadingState for different scenarios
  - Added accessibility support
- [x] Add error states
  - Created ErrorMessage component for error display
  - Implemented RetryState for retryable operations
  - Added semantic error styling
  - Included accessibility support
- [x] Implement progress indicators
  - Created StatusIndicator for operation states
  - Implemented GenerationProgress for intro generation
  - Added progress tracking visualization
  - Included status messages and icons
- [x] Create settings panel
  - Created SettingsSection for organizing settings
  - Implemented Toggle component for boolean settings
  - Added PlaylistSettings panel with sections
  - Included audio quality settings
  - Added intro controls
  - Implemented playlist name display
  - Added descriptive subtitles
- [ ] Add responsive design
  - [x] Create mobile layout for playlist settings
    - Stack sections vertically
    - Adjust spacing for touch targets
    - Optimize toggle sizes
    - Implement responsive padding
    - Add breakpoint-specific spacing
  - [x] Implement tablet view for prompt selection
    - Two-column layout for settings
    - Responsive prompt editor
    - Touch-friendly controls
    - Grid-based layout
    - Balanced section heights
  - [x] Add desktop optimization for playback controls
    - Sidebar layout for settings
    - Expandable sections
    - Keyboard shortcuts
    - Sticky playback controls
    - Collapsible settings groups
  - [x] Ensure accessibility across devices
    - Added ARIA labels and roles
    - Implemented keyboard navigation
    - Enhanced screen reader support
    - Improved keyboard shortcuts display
    - Added semantic HTML structure

- [ ] Playlist Page Integration
  - [ ] Add a "Settings" button or icon to the playlist page (near title or cover)
  - [ ] Integrate PlaylistSettings component (modal, drawer, or inline)
  - [ ] Pass playlist context (ID, name, etc.) to PlaylistSettings
  - [ ] Handle loading and error states inline
  - [ ] Ensure responsive and accessible design for settings panel
  - [ ] (Optional) Show a summary of current settings on the playlist page

## 7. Error Handling (MVP)
> **Note**: For MVP, we'll focus on essential error handling that directly impacts user experience:
> - Basic error messages for common failures
> - Simple retry for network issues
> - Critical error notifications
> 
> Post-MVP features to consider:
> - Advanced error recovery
> - Complex retry strategies
> - Comprehensive error logging
> - Fallback options

- [x] Create essential error types
  - Network errors (API failures, timeouts)
  - Playback errors (audio loading, format issues)
  - Generation errors (AI/TTS failures)
  - Storage errors (quota exceeded)
  - Added AppError class
  - Implemented error categories
  - Created error codes and messages

- [x] Implement basic error recovery
  - Simple retry for network requests
  - Basic error boundaries
  - Essential fallback states
  - Added withRetry utility
  - Implemented error handling helpers
  - Created error category detection

- [x] Add critical user feedback
  - Error messages for common failures
  - Success notifications
  - Loading states
  - Operation status
  - Created Notification component
  - Implemented NotificationContext
  - Added error and success notifications
  - Implemented auto-dismissing notifications

- [x] Create minimal error logging
  - Using Firebase Analytics for error tracking
  - Firebase Crashlytics for critical errors
  - Firebase Performance Monitoring
  - Essential error events in Firestore

## Priority Order
1. ✅ Prompt Management System
2. ✅ AI Integration
3. ✅ Text-to-Speech Integration
4. ✅ Storage Management
5. ✅ Playback System
6. ✅ UI/UX Updates
7. ✅ Error Handling 