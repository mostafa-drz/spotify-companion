# 🎯 User Story: Migrate Intro Generation to Dotprompt

## Executive Summary
To improve maintainability and simplify our AI integration, we will migrate the intro generation feature to use GenKit's Dotprompt format. This will leverage GenKit's built-in functionality for structured prompts, model interactions, and Firebase integration.

---

## 1. Background & Motivation
- **Current State:** Multiple layers of AI service implementation (`ai.ts`, `ai-service.ts`, `genKit.ts`) with string-based prompts.
- **Goal:** Single, clean implementation using GenKit and Dotprompt.
- **Benefits:** Simpler codebase, better type safety, and easier prompt management.

---

## 2. User Story
**As a** developer,  
**I want** a simplified AI integration using GenKit and Dotprompt,  
**so that** I can maintain and extend the intro generation feature more easily.

---

## 3. Acceptance Criteria
- [x] All intro generation uses a `.prompt` file in Dotprompt format.  
  _`app/lib/prompts/intro.prompt` exists and is well-formed._
- [x] Input schema includes: `trackDetailsJSON`, `userAreaOfInterest`, `language`, `tone?`, `length?`.  
  _Schema is defined in the prompt file._
- [x] Output schema includes: `markdown`, `ssml`, `duration`, `error?`.  
  _Schema is defined in the prompt file._
- [x] Single source of truth for AI interactions using GenKit.
  _Implemented in `genKit.ts` using proper prompt loading._
- [x] Simplified caching mechanism using Firestore.
  _Implemented with parameter-based cache invalidation._
- [x] Clear separation between prompt definition and business logic.
  _Achieved through Dotprompt's structured format._

---

## 4. Implementation Plan
### Milestone 1: Clean Up Existing Implementation ✅
- [x] Remove redundant AI service layers:
  - [x] Remove `ai-service.ts`
  - [x] Remove `prompts/loader.ts`
  - [x] Clean up `genKit.ts` to use Dotprompt directly
- [x] Update `ai.ts` to be the single entry point for AI interactions

### Milestone 2: GenKit Integration ✅
- [x] Update GenKit configuration:
  - [x] Configure GenKit with proper model and plugins
  - [x] Set up proper error handling
  - [x] Add type definitions for inputs/outputs
- [x] Implement prompt loading:
  - [x] Use GenKit's built-in prompt loading
  - [x] Remove custom prompt loader
  - [x] Add proper error handling for prompt loading

### Milestone 3: Firebase Integration ✅
- [x] Simplify caching:
  - [x] Use Firestore for caching only
  - [x] Remove in-memory caching
  - [x] Add proper cache invalidation
- [x] Update data models:
  - [x] Align Firestore schema with Dotprompt output
  - [x] Add proper indexing
  - [x] Update security rules if needed

### Milestone 4: Documentation & Cleanup
- [x] Update README with new architecture:
  - [x] Document GenKit integration
  - [x] Explain Dotprompt usage
  - [x] Add setup instructions
- [x] Add code comments:
  - [x] Document key functions
  - [x] Explain caching strategy
  - [x] Add type documentation
- [x] Clean up old code:
  - [x] Remove unused imports
  - [x] Remove commented code
  - [x] Update error messages

### Milestone 5: Client-Side Updates
- [x] Update API Routes:
  - [x] Update `app/api/intro/route.ts` to use new GenKit integration
  - [x] Remove references to old `ai-service`
  - [x] Update request/response types
  - [x] Add proper error handling
- [x] Review Client Components:
  - [x] Check for any direct usage of old AI service
  - [x] Update any components using the intro generation API
  - [x] Add loading states for GenKit operations
- [x] Update Types:
  - [x] Ensure all types are properly exported
  - [x] Update any interfaces affected by the migration
  - [x] Add proper type guards where needed

---

## 5. Technical Notes
- **Prompt Location:** `app/lib/prompts/intro.prompt`
- **GenKit Configuration:** `app/lib/genKit.ts`
- **Main Service:** `app/lib/ai.ts`
- **Dependencies:**
  ```json
  {
    "@genkit-ai/googleai": "^1.9.0",
    "genkit": "^1.9.0"
  }
  ```

### Implementation Details
1. **GenKit Setup**
   ```typescript
   const ai = genkit({
     plugins: [googleAI()],
     model: gemini15Flash,
     promptDir: './app/lib/prompts'
   });
   ```

2. **Prompt Loading**
   ```typescript
   const introPrompt = ai.prompt('intro');
   const { output } = await introPrompt(input);
   ```

3. **Error Handling**
   - GenKit handles schema validation
   - Custom error handling for business logic
   - Proper error propagation to UI

4. **Caching Strategy**
   ```typescript
   // Cache invalidation based on parameters
   if (docData?.introText && 
       docData.language === language && 
       docData.tone === tone && 
       docData.length === length) {
     return cachedIntro;
   }
   ```

---

## 6. Success Criteria
- [x] Single, clean implementation of AI interactions
- [x] Proper use of GenKit's features
- [x] Maintainable code structure
- [x] No regression in functionality

---

## 7. References
- [GenKit Documentation](https://firebaseopensource.com/projects/firebase/genkit/)
- [Dotprompt Specification](https://firebaseopensource.com/projects/firebase/genkit/docs/prompts/)
- See `app/lib/prompts/intro.prompt` for the current Dotprompt template.