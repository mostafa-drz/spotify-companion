# 💰 User Story: Simple Pay-as-You-Go Credit System

## Overview
As a user, I want to use the app's AI features with a simple credit system that allows me to understand my usage and easily get more credits when needed. The system should be transparent, easy to understand, and seamlessly integrated into the existing user experience.

## User Journey
1. **First-Time User**
   - User signs in with Spotify
   - Receives initial demo credits
   - Sees credit balance in the UI
   - Gets clear feedback when credits are used

2. **Regular Usage**
   - User sees remaining credits
   - Gets notified when credits are low
   - Understands credit cost per operation
   - Can contact support for more credits

3. **Credit Depletion**
   - User receives clear notification
   - Gets easy access to contact support
   - Can continue using free features
   - Understands how to get more credits

## Technical Implementation
- Extend User model with credit fields
- Add credit management actions
- Integrate credit checks with AI and TTS services
- Add credit balance display and notifications
- Implement contact support flow
- Add error handling for credit-related issues

## Acceptance Criteria
- [x] New users receive initial demo credits
- [x] Credit balance is visible in UI
- [x] Credit costs are transparent
- [x] Operations fail gracefully with insufficient credits
- [x] Users can easily contact support for more credits
- [x] Credit system is extendable for future features
- [x] All feedback is handled via minimal inline messages
- [x] System is accessible and mobile-friendly

## Success Metrics
- User understanding of credit system
- Credit usage patterns
- Support request patterns
- User retention after credit depletion
- Feature usage with credit system

## Implementation Plan
1. Extend User model and add credit management
2. Integrate credit system with existing services
3. Add credit balance display and notifications
4. Implement contact support flow
5. Add error handling and recovery
6. Test and document the system

## Notes
- Keep the system simple and transparent
- Focus on user experience
- Make it easy to extend for future features
- Maintain the app's minimal design philosophy
- All feedback should be inline and non-intrusive

## Status: ✅ Completed
This user story defines a simple, transparent credit system that enhances the user experience while maintaining the app's minimal design philosophy.

## Subtasks

### 1. Core System
- [x] Define credit system interfaces
  ```typescript
  interface User {
    availableCredits: number;
    usedCredits: number;
  }

  enum UserTransaction {
    GENERATE_TRACK_INTRO = 'GENERATE_TRACK_INTRO'
  }

  const TRANSACTION_COSTS = {
    [UserTransaction.GENERATE_TRACK_INTRO]: 1
  }
  ```
- [x] Implement credit management actions
  - [x] Initialize user credits on signup
  - [x] Check credit availability
  - [x] Deduct credits after successful operations
  - [x] Handle failed operations (no credit deduction)

### 2. UI Integration
- [x] Add credit balance display
  - [x] Show in user menu
  - [x] Show in now playing page
  - [x] Add low credit warning
- [x] Add credit usage feedback
  - [x] Show credit cost before operation
  - [x] Show credit deduction after operation
  - [x] Show remaining credits
- [x] Add contact support flow
  - [x] Low credit notification
  - [x] Contact button
  - [x] Clear instructions

### 3. Service Integration
- [x] Update AI generation service
  - [x] Add credit check before generation
  - [x] Add credit deduction after success
  - [x] Handle insufficient credits
- [x] Update TTS service
  - [x] Add credit check before conversion
  - [x] Add credit deduction after success
  - [x] Handle insufficient credits

### 4. Error Handling
- [x] Add credit-specific errors
  ```typescript
  enum CreditError {
    INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
    OPERATION_FAILED = 'OPERATION_FAILED',
    SYSTEM_ERROR = 'SYSTEM_ERROR'
  }
  ```
- [x] Add error recovery flows
  - [x] Retry with sufficient credits
  - [x] Contact support option
  - [x] Clear error messages

### 5. Testing & Documentation
- [x] Test credit system integration
  - [x] Credit initialization for new users
  - [x] Credit checks before operations
  - [x] Credit deduction after success
  - [x] Error handling for insufficient credits
- [x] Test error handling and recovery
  - [x] Insufficient credits scenario
  - [x] Operation failure scenarios
  - [x] Error message clarity
- [x] Document credit system for users
  - [x] Added to product plan
  - [x] Added to README
  - [x] Clear credit balance display
  - [x] Low credit warnings
  - [x] Support contact information
- [x] Document system for future extensions
  - [x] Credit system architecture
  - [x] Service integration points
  - [x] Future enhancement possibilities

## Implementation Details
### Credit Display
- Credit balance shown in user menu and now playing page
- Low credit warning banner appears on now playing page when credits are low
- Banner includes direct email link to hi@mostafa.xyz
- Banner uses subtle yellow color scheme for visibility without being intrusive

### Credit Management
- Initial credits given on signup
- Credits deducted after successful operations
- Failed operations don't deduct credits
- Credit balance auto-refreshes every minute

### Service Integration
- Credit checks performed at route level
- AI intro generation requires 1 credit
- Credits checked before operation starts
- Credits deducted only after successful generation
- 402 status code returned for insufficient credits
- Clear error messages for credit-related issues
- TTS generation included in intro generation credit cost
- No separate credit cost for TTS to simplify user experience

### Contact Support
- Simple email-based support system
- Clear instructions in low credit banner
- Direct mailto link for easy contact
- Support email: hi@mostafa.xyz

### Testing Results
- Credit initialization works correctly for new users
- Credit checks prevent operations when insufficient
- Credit deduction only happens after successful operations
- Error messages are clear and actionable
- Low credit warnings appear at appropriate times
- Support contact flow is simple and effective

### Future Considerations
- Credit packages
- Referral system
- Usage analytics
- Automated credit top-up
- Credit expiration
- Different credit costs for different features 