<!--
Sync Impact Report
Version change: placeholder template -> 1.0.0
Modified principles:
- PRINCIPLE_1_NAME -> I. Type Safety First
- PRINCIPLE_2_NAME -> II. User Experience States Are Mandatory
- PRINCIPLE_3_NAME -> III. Favorites Must Be Reliable
- PRINCIPLE_4_NAME -> IV. API Logic Must Stay Isolated
- PRINCIPLE_5_NAME -> V. Components Must Stay Focused
Added principles:
- VI. Tests Must Protect Core Behavior
- VII. Accessibility and Responsiveness Are Required
- VIII. Errors Must Be User-Friendly
- IX. Scope Control
Added sections:
- Technical Boundaries
- Development Workflow and Quality Gates
Removed sections:
- Placeholder Section 2
- Placeholder Section 3
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/spec-template.md
- updated: .specify/templates/tasks-template.md
- updated: .agents/skills/speckit-tasks/SKILL.md
- not present: .specify/templates/commands/*.md
- reviewed: README.md
- reviewed: docs/specs/01-cinelist-design.md
- reviewed: AGENTS.md
Follow-up TODOs: none
-->

# CineList Constitution

## Core Principles

### I. Type Safety First

All application code MUST be written in TypeScript with meaningful, explicit
types. Movie entities, favorite movie objects, API response shapes, route
parameters, service return values, and error structures MUST use named types or
interfaces. Use of `any` is prohibited unless the code includes a narrow,
documented justification and no safer type can reasonably model the value.

Rationale: CineList depends on external API data and browser storage. Explicit
types make data contracts visible, reduce runtime failures, and keep refactors
safe.

### II. User Experience States Are Mandatory

Every route or component that loads data MUST provide loading, success, empty,
and error states where those states can occur. API requests, storage failures,
invalid route parameters, and missing records MUST give the user visible
feedback. The UI MUST NOT leave a blank or stale screen while asynchronous work
is pending or failed.

Rationale: A movie discovery app depends on network and storage operations.
Users need clear feedback to understand whether content is loading, unavailable,
empty, or recoverable.

### III. Favorites Must Be Reliable

Favorites are a core CineList feature. Adding or removing a favorite MUST update
the visible UI immediately, persist the new state to `localStorage`, and keep
open browser tabs synchronized whenever the platform provides storage events.
Storage errors MUST be handled without corrupting the in-memory state.

Rationale: Favorites are the user's personal movie list. Losing, delaying, or
desynchronizing that state breaks the primary value of the application.

### IV. API Logic Must Stay Isolated

TMDB API calls, request configuration, response normalization, and error mapping
MUST stay inside the service layer or service-specific query hooks. React
components MUST NOT contain direct `fetch`request logic for TMDB.
Components may call typed services, context APIs, or hooks that encapsulate
request behavior.

Rationale: Isolating API logic keeps components focused on presentation and
interaction while making network behavior testable and replaceable.

### V. Components Must Stay Focused

Components MUST have clear responsibilities. Pages may compose features and
route-level data, but reusable UI pieces such as movie cards, grids, buttons,
loading indicators, and error messages MUST remain independent from TMDB request
details and favorites persistence internals. Shared components MUST be easy to
render in tests with explicit props.

Rationale: Focused components reduce coupling, make UI states easier to test,
and prevent page-specific behavior from leaking into reusable elements.

### VI. Tests Must Protect Core Behavior

Core behavior MUST be covered by automated tests before a feature is considered
complete. Required coverage includes API services, favorites storage, favorites
context behavior, route behavior, loading states, error states, empty states,
and favorite/remove interactions. New or changed core behavior MUST include
tests that fail without the implementation and pass with it.

Rationale: CineList relies on external API data, browser persistence, and route
state. Tests protect the flows most likely to regress during feature work.

### VII. Accessibility and Responsiveness Are Required

Interactive elements MUST be keyboard-accessible, use semantic HTML where
possible, and provide clear accessible names when visual text is insufficient.
Layouts MUST work on mobile, tablet, and desktop widths without overlapping
content, clipped controls, unreadable text, or broken interaction targets.

Rationale: Movie browsing and favorites management must remain usable across
devices and input methods.

### VIII. Errors Must Be User-Friendly

Technical errors MUST be mapped to clear user-facing messages. API failures,
invalid movie IDs, missing movies, rate limits, malformed storage data, and
storage quota failures MUST be handled without crashing the whole application.
Where recovery is possible, the UI MUST provide an appropriate retry, fallback,
or navigation path.

Rationale: Users cannot act on implementation details. Clear error handling
keeps the application understandable and recoverable when dependencies fail.

### IX. Scope Control

The current project scope is movie discovery, movie details, favorites,
persistence, synchronization, and basic error handling. Search, pagination,
custom ratings, user accounts, backend synchronization, sharing, and other
expanded features MUST NOT be implemented unless a future specification
explicitly adds them.

Rationale: A bounded scope keeps CineList focused, testable, and deliverable
without premature product expansion.

## Technical Boundaries

CineList is a React, Vite, TypeScript, and Vitest application that uses the TMDB
API for movie data and `localStorage` for favorites persistence. Feature work
MUST preserve this architecture unless a specification explicitly amends it.
TMDB access belongs in the service layer. Favorites persistence belongs in a
storage service and favorites context or hook layer. Route components may
compose those layers but MUST NOT bypass them.

Implementation plans MUST identify typed data models, affected services,
affected components, user experience states, storage behavior, route behavior,
accessibility and responsive considerations, and required tests before coding.

## Development Workflow and Quality Gates

Feature specifications MUST stay within the active scope and define user
scenarios, acceptance criteria, edge cases, failure modes, and measurable
outcomes. Plans MUST complete a Constitution Check before design work and again
after design. Any violation MUST be documented with a specific justification and
a simpler alternative that was rejected.

Task lists MUST include tests for all changed core behavior described in this
constitution. A feature is not complete until linting, type checking, and the
relevant automated tests pass, or until any unavailable verification is recorded
with a concrete reason.

Code review MUST verify compliance with type safety, mandatory UX states,
favorites reliability, service-layer API isolation, focused components, test
coverage, accessibility and responsiveness, user-friendly errors, and scope
control.

## Governance

This constitution supersedes conflicting project practices, templates, and
informal guidance. Amendments MUST be proposed with the changed principles or
sections, the reason for the change, affected templates or runtime guidance, and
any migration work required for existing code or specifications.

Versioning follows semantic versioning. MAJOR changes remove or redefine
principles in a backward-incompatible way. MINOR changes add principles,
sections, or materially expanded governance. PATCH changes clarify wording or
correct non-semantic issues. The ratification date records initial adoption, and
the last amended date records the latest approved change.

Every new specification, plan, task list, and implementation review MUST check
against this constitution. Dependent templates and agent guidance MUST be kept
in sync in the same change whenever possible.

**Version**: 1.0.0 | **Ratified**: 2026-07-08 | **Last Amended**: 2026-07-08
