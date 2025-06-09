## 🧠 Lessons from Using AI Coding Assistants

Here are some lessons I learned using AI-assisted tools like Cursor, ChatGPT, etc. These are not principles—just observations I'm sharing.

---

### 1. **Use Descriptive Names**

Good names go a long way—for variables, functions, files, everything. AI assistants are like strangers to your code. Clear naming helps them (and you) understand and connect the dots faster.

---

### 2. **Keep Code Small and Modular**

Shorter files and focused modules make it easier for AI to read and work with. Long files lead to confusion and performance issues.

---

### 3. **Be Involved in Design**

AI can generate code fast, but it doesn't understand the big picture. If you're not involved in the early design and decisions, things will break later—and you'll have no idea why.

---

### 4. **Write User Stories for Large Tasks**

For anything big, take a moment to write a user story or clear task definition before you dive in. Think like a PM. It saves time and avoids messy prompts.  
You can find some examples at [`docs/userStories/`](../docs/userStories/).

---

### 5. **Focus on One Task at a Time**

Don't mix multiple tasks in one prompt. Just fix one thing at a time. It works better and avoids confusion.

---

### 6. **Document Core Concepts**

Keep your main ideas (product plan, design system, core decisions) in docs. When things drift, you can reference them. It also helps the AI stay aligned.

- _Example: Having a clear product plan and design system doc kept the AI suggestions on track during major refactors and UI work._
- See: [`docs/PRODUCT_PLAN.md`](../docs/PRODUCT_PLAN.md), [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md), [`docs/userStories/landing-page-redesign.md`](../docs/userStories/landing-page-redesign.md)

---

### 7. **Use Linked Tasks for Mid-Sized Features**

Ask the AI to list all subtasks for a feature or refactor before starting. Then, tackle them one by one, with your explicit approval before each step. Before moving on to the next subtask, always have the AI announce the remaining tasks—this keeps both of you aligned, prevents drift, and allows you to reprioritize or clarify as needed. I call this "linked tasks"—simple but highly effective. For smaller tasks, break them down in the chat using this approach; for larger tasks, I still recommend writing user stories.

**Example Workflow:**

```
You: Let's refactor the playback logic. What are the subtasks?
AI: Here are the subtasks:
    1) Create new PlaybackContext
    2) Refactor IntroControls
    3) Update NowPlayingPage
    4) Remove obsolete code
You: Great, do step 1.
AI: Step 1 done. Remaining tasks:
    2) Refactor IntroControls
    3) Update NowPlayingPage
    4) Remove obsolete code
    Should I proceed with step 2?
You: Yes, go ahead.
```

This approach ensures transparency, keeps the process organized, and gives you a chance to catch misunderstandings or adjust priorities before moving forward.

---

### 8. **Discuss Bugs Before Fixing**

Don't rush into fixing bugs. Ask the AI to explain what's going wrong first. You verify the problem, then apply the fix. This avoids "fixing the wrong thing" loops.

---

### 9. **Use Visuals for UI Work**

For frontend work, use annotated screenshots or sketches. Explaining layout in words is hard—images work much better. Something as simple as a sketch ona paper with pen should be enough

---

### 10. **Avoid Multitasking Prompts**

I know I said it already, but it's that important. Focus on one task per prompt. It keeps things clean.

---

### 11. **Write Clear Commit Messages**

AI tools use commit history too. Clean commits = better suggestions. Helps you stay in control.

---

### 12. **Avoid Relying on AI for New Tech**

If you're working with bleeding-edge tools (like Next.js 15, React Server Components, etc.), don't expect too much. AI is often outdated or just plain wrong.

---

### 13. **Don't Outsource Everything**

Sometimes writing a good prompt takes longer than just doing the task yourself. Be mindful of when to use AI—and when to just code. Sometimes it's easier to do it yourself rather than explaining it to AI; just be self-aware about it.

---
