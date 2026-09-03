# API Dependency Monitoring System

A multi-tenant system for monitoring the uptime and health of applications and their dependencies. Organizations can track their applications, the dependencies each one relies on (databases, third-party APIs, internal services), and get automatically alerted the moment something goes down — with full incident history and reliability analytics.

Built with Node.js, Express, and PostgreSQL.

## What it does

Organizations can register, add applications, and track the external/internal dependencies each application relies on (databases, third-party APIs, internal services). Each dependency can have one or more monitors that periodically check its health via HTTP requests. When a dependency crosses a failure threshold, an incident is opened and an alert email is sent — and another alert is sent when it recovers.

```
Application
   └── Dependency (e.g. Payment Gateway, Database)
         └── Monitor (periodic HTTP health check)
               └── Health Checks (history) → Incidents (lifecycle) → Email Alerts
```

## Core features

### Multi-tenancy & Auth
- Organization and user data models, with applications/dependencies/monitors scoped per organization
- Registration creates an organization and its first admin user in a single database transaction
- Login issues a JWT (with `userId`, `organizationId`, `role`), verified via timing-attack-resistant password comparison
- Authentication middleware validates JWTs on protected routes
- Tenant isolation enforced across every API — one organization can never read or modify another's data
- Role-based access control — admins can create member users scoped to their own organization

### Application / Dependency / Monitor management
- CRUD endpoints for applications, dependencies, and monitors, each scoped through ownership checks up the hierarchy (monitor → dependency → application → organization)
- Monitor validation: URL format, allowed HTTP methods, expected status code range, check interval, and timeout
- Dependency type is restricted to a fixed set of categories (`EXTERNAL_API`, `INTERNAL_SERVICE`, `THIRD_PARTY`) for consistent filtering/reporting

### Health checks & incident lifecycle
- A scheduler runs on a fixed interval, checking every monitor that's currently due
- Monitors are processed with a bounded worker-pool (`processWithConcurrency`), so a slow check doesn't block others, and an in-progress guard prevents overlapping scheduler runs
- Each health check result is saved transactionally alongside monitor state updates (consecutive failure count, current status), using row-level locking (`SELECT ... FOR UPDATE`) to stay safe under concurrent access
- An incident opens automatically once a monitor crosses a consecutive-failure threshold, and resolves automatically on recovery
- DOWN and RECOVERED email alerts are sent after the transaction commits (never inside it), and a failed email send is caught and logged without affecting health-check processing

### Reliability analysis
- Per-monitor historical analysis endpoint (`1h` / `24h` / `7d` / `30d` ranges) — total checks, successful/failed checks, uptime percentage, and average/min/max response time — computed via SQL aggregation (`FILTER`, `NULLIF`) rather than in application code

### Frontend
- React (Vite) frontend for registration, login, and application management
- Client-side search/filtering over the applications list

## Tech stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (raw SQL via `pg`, transactions, row-level locking, composite indexes)
- **Auth:** JWT, bcrypt
- **Scheduling:** node-cron, custom concurrency-limited worker pool
- **Email:** Nodemailer
- **Frontend:** React, Vite

## Project structure

```
src/
├── config/          # Database and email configuration
├── controllers/      # Request handlers (asyncHandler + AppError pattern)
├── database/          # Schema
├── middleware/         # Auth, error handling
├── routes/              # Express routers
├── scheduler/            # Cron-driven health check runner
├── services/              # Business logic and DB queries
├── utils/                  # Shared helpers (pagination, concurrency, errors)
├── app.js
└── server.js
```

## Getting started

```bash
git clone https://github.com/PranitBijave27/API_Monitoring_System
cd api-dependency-monitor
npm install
cp .env.example .env   # fill in your DB and JWT config
npm run dev
```

### Environment variables

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
JWT_SECRET=
```

## API overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register a new organization + admin user |
| `POST /api/auth/login` | Log in, receive a JWT |
| `GET /api/applications` | List applications for the organization |
| `POST /api/applications` | Create an application |
| `POST /api/applications/:applicationId/dependencies` | Add a dependency to an application |
| `POST /api/dependencies/:dependencyId/monitors` | Add a monitor to a dependency |
| `GET /api/monitors/:monitorId/health-checks` | Paginated health check history |
| `GET /api/monitors/:monitorId/reliability?range=` | Uptime and response-time stats over a time range |

## Design notes & known limitations

- The scheduler's overlap guard (in-memory flag) and concurrency limit are correct for a **single-instance** deployment. Running multiple instances would require a distributed lock (e.g. a Postgres advisory lock) or designating one instance as the dedicated scheduler — otherwise the in-memory state wouldn't be shared across processes, and the total DB connection usage from health checks would multiply per instance.
- Alerting is intentionally basic for now: one email on threshold-reached, one on recovery — no re-alerting on continued downtime or escalation. A production version would track delivery status per notification (an outbox-style table) and support retries.
- The more scalable evolution of the scheduler would move health-check execution into a job queue (e.g. BullMQ + Redis), so a shared queue — not in-process state — coordinates work across multiple worker instances.

## Author

Pranit Bijave — [GitHub](https://github.com/PranitBijave27) · [LinkedIn](https://linkedin.com/in/pranitbijave)