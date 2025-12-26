# ReadSphere Backend – Branch Strategy & Admin Stories

This README consolidates the branch strategy and the JIRA-style epic/story breakdown for quick reference within the backend module.

---

## Branch Strategy

- Main/Integration:
  - `main` — production-ready
  - `dev` — active development (integration)
- Feature/Area Branches:
  - `feature/User-Management`
  - `feature/Book-Management`
  - `feature/AI-Recommendation-System`
  - `feature/Dashboard-&-Analytics`
  - `Azure-Cloud-Integration`
  - `NET-Microservice- (Book-Inventory)`
  - `Security-&-Performance`
  - `Testing-&-Quality`
  - `DevOps-&-CI/CD`
- Bugfix: `bugfix/<description>`
- Hotfix (from main): `hotfix/<critical-issue>`
- Release: `release/v1.0.0`, `release/v1.1.0`, ...

---

## Essential User Stories with Admin Features

### 1. User Management & Authentication
- User: register/login, view/update profile, reset password.
- Admin: view all users; deactivate/delete accounts.

### 2. Book Management (progress, notes, sharing/export)
- User: add/edit/delete books; search; log daily progress; charts; notes.
- Admin: view all books; delete inappropriate/duplicate books.

### 5. AI Recommendation System
- User: recommendations from history; mood/genre suggestions.
- Admin: monitor recommendation logs; tune rules/algorithms.

### 6. Social Sharing & Export
- User: export reading list to PDF; share top 5 books.
- Admin: moderate shared content; view sharing analytics.

### 7. Dashboard & Analytics
- User: dashboard with stats (books, pages, favorite genres).
- Admin: platform-wide stats (active users, books, shares); generate reports.

### 8. Azure Cloud Integration
- User: cloud-stored covers for faster loading; deployed app on Azure.
- Admin: manage cloud resources (storage, DB) for performance/cost.

### 9. .NET Microservice (Book Inventory)
- User: fetch available books from inventory.
- Admin: CRUD inventory; auto-sync with Azure SQL.

### 10. Security & Performance
- User: secure auth (JWT); fast queries.
- Admin: monitor security logs; configure caching/DB optimizations.

### 11. Testing & Quality
- User/Dev: unit tests for APIs; E2E for critical flows.
- Admin: review coverage reports.

### 12. DevOps & CI/CD
- Dev: CI builds/tests; automated deploy to Azure.
- Admin: monitor deployment logs/health; alerts on failures.

---

## One-Month Plan (Simplified)

| Week | Focus | Tasks |
| --- | --- | --- |
| Week 1 | Core Setup & User Management | Project scaffolding; user register/login/profile/reset; JWT auth; admin user management (view/deactivate). |
| Week 2 | Book Management & Tracker | Book CRUD/search; reading progress; charts; notes; admin book monitoring/deletion. |
| Week 3 | AI & Dashboard | Recommendation engine; personalized suggestions; user & admin dashboards; top 5 sharing; analytics. |
| Week 4 | Cloud, Microservices, Security & DevOps | Azure Blob & App Service deployment; .NET inventory API; admin inventory CRUD & sync; PDF export; security monitoring; CI/CD pipeline; testing. |

---

## Epic & Story Breakdown (Keys: RS-100 ... RS-1200)

Refer to the full details in [branch-strategy.md](branch-strategy.md) for complete epic/story descriptions and acceptance criteria.

---

## Workflow

See [branch-strategy.md](branch-strategy.md) for the latest workflow notes.
