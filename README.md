# LeadFlow

LeadFlow is a focused, single-screen lead management workspace. It helps a sales rep see who needs attention today, preserve the full context of every conversation, and move opportunities forward without the overhead of a large CRM.

The project was built for the PravarAI full-stack engineering assessment using the requested **Next.js + FastAPI** stack.

## What it includes

- Secure login with Argon2 password hashing and JWT authentication
- Lead list with status, company, latest note, note count, and relative activity time
- Today's follow-ups pinned into a dedicated focus section
- Overdue follow-ups highlighted in red
- Search by lead name or company
- Filters for New, Contacted, Qualified, Proposal Sent, Won, and Lost
- Lead timeline dialog with reverse-chronological discussion history
- Add discussion notes with an optional follow-up date and time
- Update a lead's status directly from its timeline
- Add new leads with required-name validation
- Responsive desktop and mobile interface
- PostgreSQL persistence, Alembic migrations, and a repeatable seed command
- Docker Compose setup for the full application
- Backend API tests and GitHub Actions CI

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, custom responsive CSS |
| API | FastAPI, Pydantic, SQLAlchemy 2 |
| Authentication | JWT bearer tokens, Argon2 password hashing |
| Database | PostgreSQL 17 with Alembic migrations |
| Tooling | Docker Compose, uv, Ruff, Pytest, ESLint |

## Quick start with Docker

Docker Desktop (or another Docker daemon) is required.

```bash
cp .env.example .env
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

The API container automatically applies migrations and seeds demo data on startup. The seed is idempotent, so restarting the stack does not duplicate records.

### Demo account

```text
Email:    demo@leadflow.dev
Password: demo1234
```

For a real deployment, replace `JWT_SECRET` and the seed credentials in `.env`.

## Run locally without Docker

### 1. Start PostgreSQL

Create a `leadflow` database and set `DATABASE_URL` in `.env`. The default URL is:

```text
postgresql+psycopg://leadflow:leadflow@localhost:5432/leadflow
```

### 2. Start the API

```bash
cd backend
uv sync --all-groups
uv run alembic upgrade head
uv run python -m app.seed
uv run uvicorn app.main:app --reload
```

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `NEXT_PUBLIC_API_URL=http://localhost:8000` by default.

## Environment variables

Every required variable is documented in [`.env.example`](.env.example).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy database connection URL |
| `JWT_SECRET` | Secret used to sign access tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |
| `NEXT_PUBLIC_API_URL` | Public URL of the FastAPI service |
| `SEED_USER_EMAIL` | Email for the seeded demo account |
| `SEED_USER_PASSWORD` | Password for the seeded demo account |

## Useful commands

```bash
# Frontend checks
cd frontend
npm run lint
npm run build

# Backend checks
cd backend
uv run ruff check .
uv run pytest -q

# Re-run the idempotent seed
uv run python -m app.seed
```

## API overview

All lead endpoints require a bearer token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate and obtain a JWT |
| `GET` | `/api/auth/me` | Return the current user |
| `GET` | `/api/leads` | List, search, and filter leads |
| `POST` | `/api/leads` | Create a lead (`201 Created`) |
| `PATCH` | `/api/leads/{id}/status` | Persist a status change |
| `GET` | `/api/leads/{id}/discussions` | Load the newest-first timeline |
| `POST` | `/api/leads/{id}/discussions` | Add a note and optional follow-up (`201 Created`) |

## Design and implementation decisions

- **Single-screen workflow:** Creation and lead details stay in dialogs, so the rep never loses list context.
- **Immediate consistency:** After a successful mutation, local state updates and the lead summary reconciles with the API.
- **Follow-up source of truth:** Each discussion preserves the follow-up selected at that moment; the lead stores the active next follow-up used for list placement.
- **Timezone safety:** The API emits timezone-aware ISO timestamps. The browser decides whether a follow-up is today or overdue in the user's local timezone.
- **Atomic discussion updates:** Creating a discussion and changing the lead's active follow-up happen in one database transaction.
- **Focused authentication scope:** Login is included to demonstrate a protected application boundary. Registration and password recovery are intentionally out of scope.

## Project structure

```text
leadflow/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── app/              # FastAPI application, models, schemas, seed
│   └── tests/            # API flow and authentication tests
├── frontend/
│   ├── app/              # Next.js app and design system
│   ├── components/       # Dashboard, cards, dialogs, login
│   └── lib/              # API client, types, date utilities
├── .github/workflows/    # CI checks
└── docker-compose.yml
```

## Assessment coverage

- [x] Name, status, latest note, and time ago in the lead list
- [x] Today's follow-ups pinned correctly
- [x] Reverse-chronological discussion timeline
- [x] New discussion reflected immediately in the list
- [x] Add new lead flow
- [x] Persistent status updates from the dialog
- [x] Search and all status filters
- [x] Overdue follow-up highlighting
- [x] Docker Compose
- [x] Seed script with six leads and multiple discussions
- [x] Login and protected APIs

## AI usage disclosure

AI-assisted development was used to accelerate project scaffolding, interface implementation, test creation, and documentation. The resulting code was reviewed through production builds, automated API tests, linting, and manual browser validation of the primary user flows.
