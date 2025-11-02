# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive repository audit documentation (REPOSITORY_AUDIT.md)
- Complete README.md with API documentation and setup instructions
- LICENSE file (MIT License)
- CONTRIBUTING.md with development guidelines
- .env.example with documented environment variables
- CHANGELOG.md for version tracking

### Changed
- Updated vitest from 2.1.9 to 4.0.6 (fixes esbuild security vulnerability GHSA-67mh-4wv8-2f99)
- Moved tsx from dependencies to devDependencies (development-only tool)
- Removed typecheck workaround in CI pipeline (|| true)

### Security
- Fixed moderate severity vulnerability in esbuild (via vitest upgrade)
- esbuild now >= 0.25.0, preventing malicious websites from reading dev server responses

## [0.1.0] - 2025-11-02

### Added
- Initial project setup with TypeScript, Fastify, and Zod
- POST /analyze endpoint for photo analysis
- HMAC-SHA256 signature verification for webhook security
- Timing-safe comparison for HMAC validation
- Zod schemas for request/response validation
- Data transformation logic (payload → Notion format)
- CI/CD pipeline with GitHub Actions
- ESLint and TypeScript configuration
- Vitest test framework with HMAC authentication tests
- Notion issues sync workflow
- GitHub Copilot instructions

### Security
- HMAC signature verification with timing-safe comparison
- Environment variable for secret key management
- .gitignore includes .env files

[Unreleased]: https://github.com/stevenschling13/Notion-Grow-Ops/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/stevenschling13/Notion-Grow-Ops/releases/tag/v0.1.0
