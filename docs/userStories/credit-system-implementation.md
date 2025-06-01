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
- [ ] New users receive initial demo credits
- [ ] Credit balance is visible in UI
- [ ] Credit costs are transparent
- [ ] Operations fail gracefully with insufficient credits
- [ ] Users can easily contact support for more credits
- [ ] Credit system is extendable for future features
- [ ] All feedback is handled via minimal inline messages
- [ ] System is accessible and mobile-friendly

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

## Status: 🚧 Planned
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
- [ ] Implement credit management actions
  - [ ] Initialize user credits on signup
  - [ ] Check credit availability
  - [ ] Deduct credits after successful operations
  - [ ] Handle failed operations (no credit deduction)

### 2. UI Integration
- [ ] Add credit balance display
  - [ ] Show in user menu
  - [ ] Show in now playing page
  - [ ] Add low credit warning
- [ ] Add credit usage feedback
  - [ ] Show credit cost before operation
  - [ ] Show credit deduction after operation
  - [ ] Show remaining credits
- [ ] Add contact support flow
  - [ ] Low credit notification
  - [ ] Contact button
  - [ ] Clear instructions

### 3. Service Integration
- [ ] Update AI generation service
  - [ ] Add credit check before generation
  - [ ] Add credit deduction after success
  - [ ] Handle insufficient credits
- [ ] Update TTS service
  - [ ] Add credit check before conversion
  - [ ] Add credit deduction after success
  - [ ] Handle insufficient credits

### 4. Error Handling
- [ ] Add credit-specific errors
  ```typescript
  enum CreditError {
    INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
    OPERATION_FAILED = 'OPERATION_FAILED',
    SYSTEM_ERROR = 'SYSTEM_ERROR'
  }
  ```
- [ ] Add error recovery flows
  - [ ] Retry with sufficient credits
  - [ ] Contact support option
  - [ ] Clear error messages

### 5. Testing & Documentation
- [ ] Test credit system integration
- [ ] Test error handling and recovery
- [ ] Document credit system for users
- [ ] Document system for future extensions

## Future Considerations
- Credit packages
- Referral system
- Usage analytics
- Automated credit top-up
- Credit expiration
- Different credit costs for different features 