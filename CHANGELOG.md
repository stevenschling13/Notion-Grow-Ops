# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 41+ tests
  - Mapping function tests (8 tests)
  - Payload validation tests (21 tests)
  - Integration tests for /analyze endpoint (8 tests)
  - HMAC verification tests (4 tests)
- Security middleware with custom headers
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: no-referrer
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Resource-Policy: same-origin
  - Permissions-Policy for camera, microphone, geolocation
  - Strict-Transport-Security with 1 year max-age
  - Content-Security-Policy: default-src 'self'
- In-memory rate limiting
  - Default: 100 requests per minute per IP
  - Bypass token support via `x-rate-limit-bypass` header
  - Automatic cleanup of expired entries
- Documentation files
  - CONTRIBUTING.md with contribution guidelines
  - ARCHITECTURE.md with system design documentation
  - CHANGELOG.md (this file)
- Enhanced README with comprehensive examples
- Environment variable: RATE_LIMIT_BYPASS_TOKEN

### Changed
- CI workflow now uses corepack for pnpm installation
- Body size limit set to 1 MiB
- Request timeout set to 30 seconds
- Connection timeout set to 60 seconds

### Fixed
- HMAC verification now uses timing-safe comparison
- Proper error handling in analyze route

## [0.1.0] - 2024-11-02

### Added
- Initial release
- Fastify-based API server
- POST /analyze endpoint for plant photo analysis
- HMAC-SHA256 signature verification for webhooks
- Zod schema validation for request/response
- TypeScript with strict mode
- ESLint configuration
- Vitest test framework
- CI/CD workflow with GitHub Actions
- Development environment with hot reload (tsx watch)

### Features
- Webhook payload validation
- Plant photo analysis job processing
- Integration with Notion (placeholder implementation)
- Vision AI integration (placeholder implementation)
- Data mapping between analysis results and Notion properties
- History entry creation for analysis results

### Dependencies
- fastify: ^4.28.1
- fastify-raw-body: ^4.3.0
- zod: ^3.23.8
- typescript: ^5.6.3
- vitest: ^2.1.3
- eslint: ^9.13.0

---

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md with new version and date
3. Commit changes: `git commit -m "chore: release vX.Y.Z"`
4. Create git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
5. Push changes: `git push && git push --tags`
6. Create GitHub release from tag

## Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
