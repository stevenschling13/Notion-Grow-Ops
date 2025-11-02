# Contributing guide

Thanks for improving Notion Grow Ops! This project is still evolving, so please follow the workflow below to keep changes predictable.

## Development workflow

1. **Install dependencies** with `pnpm install`.
2. **Create a feature branch** from `main`.
3. **Run the quality gates** locally before opening a PR:
   - `pnpm run lint`
   - `pnpm run typecheck`
   - `pnpm run test -- --run`
4. **Document behaviour changes** in the PR description and update README sections when relevant.
5. **Add tests** for new functionality or bug fixes. Prefer Vitest unit tests for pure logic and consider end-to-end coverage once integrations ship.

## Commit guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) when practical.
- Write descriptive messages (present tense, imperative mood) and keep commits focused.
- Avoid committing build artifacts or environment-specific files.

## Environment & secrets

All required environment variables are validated at runtime. Store sensitive values outside of the repository (e.g., `.env` files that are `.gitignore`d or secret managers). When enabling `ENABLE_NOTION_SYNC`, ensure the Notion tokens and database IDs are added to your secrets manager of choice.

## Pull requests

- Draft PRs are welcome for early feedback.
- Include screenshots when changing user-facing surfaces.
- The CI workflow runs lint, typecheck, and unit tests with a frozen lockfile; ensure these succeed before requesting review.

Thanks for contributing!
