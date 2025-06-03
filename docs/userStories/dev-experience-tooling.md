# User Story: Developer Experience Tooling & Automation

**As a** developer on the Spotify Companion project,
**I want** automated code formatting, linting, and pre-commit checks,
**so that** the codebase remains consistent, clean, and easy to maintain for everyone on the team.

---

## Context

Maintaining a high-quality codebase is essential for team productivity and long-term project health. Automated tooling for formatting, linting, and type checking ensures that all contributors follow the same standards and reduces friction during code reviews. Integrating these tools with pre-commit hooks further enforces quality and prevents common mistakes from entering the codebase.

---

## Acceptance Criteria

- [ ] Code is automatically formatted and linted before every commit.
- [ ] Formatting and linting can be run manually via npm scripts.
- [ ] TypeScript type checking is available as a script.
- [ ] All configuration files are present and versioned.
- [ ] Tooling does not interfere with existing project rules or workflow.

---

## Tasks

### 1. Install and Configure Tooling

- [x] Add ESLint, Prettier, Husky, lint-staged, and related plugins as devDependencies.
- [x] Ensure TypeScript and @typescript-eslint packages are up to date.

### 2. Add/Update NPM Scripts

- [x] Add scripts for `lint`, `format`, `ts:check`, and `prepare` in `package.json`.

### 3. Configure Prettier

- [x] Create or update `.prettierrc` with project formatting rules.

### 4. Configure ESLint

- [ ] Create or update `.eslintrc.json` to extend Next.js and Prettier.

### 5. Set Up Husky and lint-staged

- [x] Initialize Husky and add a pre-commit hook to run lint-staged.
- [x] Configure lint-staged in `package.json` to run ESLint and Prettier on staged files.

### 6. (Optional) VSCode Settings

- [x] Add recommended settings for format-on-save and ESLint integration in `.vscode/settings.json`.

### 7. Documentation

- [ ] Add a section to the project README or this user story describing how to use the tooling and available commands.

---

## Open Questions

- Should we enforce formatting/linting on all file types, or only on source files?
- Are there any project-specific rules or exceptions that should be documented?
