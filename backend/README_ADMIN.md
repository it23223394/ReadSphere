# ReadSphere Backend – Admin Guide

This document describes the Admin capabilities for ReadSphere, covering RBAC, APIs, data, and operational guidance.

---

## Overview
- Purpose: Enable administrators to manage users, catalog, moderation, analytics, and platform operations.
- Scope: Backend endpoints and policies, with notes for frontend admin UI integration.

---

## Access Control (RBAC)
- Roles: `ADMIN`, `USER`.
- Policy:
  - `ADMIN` can access `/api/admin/**` endpoints.
  - `USER` cannot access admin endpoints.
- JWT: Include `role` claim; backend should authorize based on role.

---

## Admin APIs (Planned/Recommended)
- Users
  - GET `/api/admin/users` — list users (paginate, filter by status)
  - PATCH `/api/admin/users/{id}/deactivate` — deactivate user
  - DELETE `/api/admin/users/{id}` — hard delete user (guarded)
- Catalog
  - GET `/api/admin/catalog` — list catalog books (search, sort)
  - POST `/api/admin/catalog` — create catalog book
  - PUT `/api/admin/catalog/{id}` — update catalog book
  - DELETE `/api/admin/catalog/{id}` — delete catalog book
- Moderation
  - GET `/api/admin/moderation/notes` — review notes (flags)
  - GET `/api/admin/moderation/quotes` — review quotes (flags)
  - DELETE `/api/admin/moderation/notes/{id}` — remove content
  - DELETE `/api/admin/moderation/quotes/{id}` — remove content
- Analytics
  - GET `/api/admin/analytics/overview` — KPIs: active users, books, shares
  - GET `/api/admin/analytics/reading` — charts: books/month, genres
- System
  - GET `/api/admin/system/health` — service health & DB status
  - GET `/api/admin/system/logs` — tail recent logs (secured)

---

## Data Model Notes
- `User` — add `role: ADMIN|USER`, `status: ACTIVE|DEACTIVATED`.
- `BookCatalog` — admin CRUD source for recommendations.
- `Note`/`Quote` — add `flagged: boolean`, `flagReason: string` for moderation.
- `RecommendationFeedback` — optional admin visibility for tuning.

---

## Security & Compliance
- Authorization: method-level or path-level using Spring Security.
- Auditing: log admin actions (who, what, when) for delete/deactivate.
- Rate Limits: stricter for admin endpoints; protect `logs` and `health`.
- Secrets: use environment variables/Key Vault in production.

---

## Admin UI (Frontend Hooks)
- Pages (suggested): Users, Catalog, Moderation, Analytics, System.
- Route guard: only show admin menu when JWT `role=ADMIN`.
- API integration: use the endpoints above with pagination & search.

---

## Setup & Run
- Backend dev:
  - `mvn spring-boot:run`
- Frontend dev:
  - `npm start`
- Admin access: seed an admin user (e.g., `admin@example.com`) with role `ADMIN`.

---

## Roadmap (Admin)
- Phase 1: RBAC + Users (list/deactivate)
- Phase 2: Catalog CRUD + search
- Phase 3: Moderation (flags, removals)
- Phase 4: Analytics dashboards
- Phase 5: System health/logs + audit trails

---

## Testing
- Unit: Services and controllers for `/api/admin/**`.
- Integration: RBAC access tests (ADMIN vs USER).
- E2E: Admin flows (login as admin, catalog CRUD, deactivate user).

---

## References
- Branch & epics: see [README_BRANCH_STRATEGY.md](README_BRANCH_STRATEGY.md) and [branch-strategy.md](branch-strategy.md).
