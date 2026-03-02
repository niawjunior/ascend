# Contributing to Beta Analyzer

We want to make it easy for you to contribute to Beta Analyzer. Here are the most common type of changes that get merged:

- Bug fixes
- Performance improvements
- UI and Design tweaks
- missing standard behavior
- Documentation improvements

If you are unsure if a PR would be accepted, feel free to ask a maintainer or look for issues with any of the following labels:

- `help wanted`
- `good first issue`
- `bug`

> [!NOTE]
> PRs that ignore these guardrails will likely be closed.

Want to take on an issue? Leave a comment and a maintainer may assign it to you unless it is something we are already working on.

## Developing Beta Analyzer

- Requirements: Node.js 18+
- Install dependencies and start the dev server from the repo root:

  ```bash
  npm install
  npm run dev
  ```

This starts a local dev server at http://localhost:3000. 

## Pull Request Expectations

### Issue First Policy

**All PRs must reference an existing issue.** Before opening a PR, open an issue describing the bug or feature. This helps maintainers triage and prevents duplicate work. PRs without a linked issue may be closed without review.

- Use `Fixes #123` or `Closes #123` in your PR description to link the issue
- For small fixes, a brief issue is fine - just enough context for maintainers to understand the problem

### General Requirements

- Keep pull requests small and focused
- Explain the issue and why your change fixes it
- Before adding new functionality, ensure it doesn't already exist elsewhere in the codebase

### UI Changes

If your PR includes UI changes, please include screenshots or videos showing the before and after. This helps maintainers review faster and gives you quicker feedback.

### Logic Changes

For non-UI changes (bug fixes, new features, refactors), explain **how you verified it works**:

- What did you test?
- How can a reviewer reproduce/confirm the fix?

### No AI-Generated Walls of Text

Long, AI-generated PR descriptions and issues are not acceptable and may be ignored. Respect the maintainers' time:

- Write short, focused descriptions
- Explain what changed and why in your own words
- If you can't explain it briefly, your PR might be too large

### PR Titles

PR titles should follow conventional commit standards:

- `feat:` new feature or functionality
- `fix:` bug fix
- `docs:` documentation or README changes
- `chore:` maintenance tasks, dependency updates, etc.
- `refactor:` code refactoring without changing behavior
- `test:` adding or updating tests

Examples:

- `docs: update contributing guidelines`
- `fix: resolve crash on startup`
- `feat: add dark mode support`
- `chore: bump dependency versions`

## Issue Requirements

When a new issue is opened, an automated check verifies that it meets our contributing guidelines. All issues should be clear and descriptive. Empty or unhelpful issues may be closed.
