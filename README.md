# ThreatLens AI

**Evidence-Driven Cyber Threat Intelligence Agent**

ThreatLens AI is a cybersecurity project designed to support CVE-based
vulnerability investigations through an analyst-facing web interface and
a Python backend. The project brings together investigation workflows,
vulnerability intelligence integrations, and structured evidence.

> **Development status:** This project is under active development. Some
> features may require the backend, database, environment variables, or
> external data sources to be configured. Demonstration or mock data
> must not be treated as live threat intelligence.

## Project goals

-   Provide an interface for analysts to start investigations using a
    CVE identifier.
-   Organize vulnerability information and supporting evidence.
-   Integrate with vulnerability intelligence sources, including the
    National Vulnerability Database (NVD) and CISA Known Exploited
    Vulnerabilities (KEV) catalog.
-   Store and structure investigation information through backend
    services and data models.
-   Provide a foundation for future analysis and reporting capabilities.

## Repository structure

``` text
threatlens-ai/
├── alembic/                  # Database migration environment and versions
├── backend/
│   └── app/
│       ├── api/routes/       # Health and investigation API routes
│       ├── core/             # Application configuration
│       ├── db/               # Database setup
│       ├── integrations/     # NVD and CISA KEV integrations
│       ├── models/           # Investigation, claim, and source models
│       ├── schemas/          # API schemas
│       ├── services/         # Claim extraction and evidence services
│       └── main.py           # Backend application entry point
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── alembic.ini
└── pyproject.toml
```

The repository layout may change as development continues.

## Technology

### Frontend

-   React and TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   Axios
-   Lucide React
-   React Flow (`@xyflow/react`)

### Backend

-   Python
-   API route modules for health checks and investigations
-   Investigation, claim, and source models
-   Evidence and investigation schemas
-   Claim extraction and evidence services
-   NVD and CISA KEV integrations
-   Alembic database migrations

See `pyproject.toml` for the authoritative Python dependency list and
version constraints.

## Investigation workflow

The intended workflow is:

1.  An analyst enters a CVE identifier in the frontend.
2.  The frontend sends an investigation request to the backend.
3.  Backend services coordinate the available vulnerability-data
    integrations.
4.  Investigation information and supporting evidence are organized
    using backend schemas and models.
5.  The frontend displays the investigation response.

The availability and completeness of each step depend on the current
implementation and configuration. Verify findings against original
authoritative sources.

## Prerequisites

-   Git
-   Node.js and npm
-   A Python version compatible with `pyproject.toml`
-   A database supported by the backend configuration, if required
-   Any environment variables or API credentials required by enabled
    integrations

## Run the frontend

From the repository root:

``` powershell
cd frontend
npm install
npm run dev
```

The Vite development server is configured for port `5173`. Open:

``` text
http://localhost:5173
```

### API proxy

The current `frontend/vite.config.ts` proxies requests beginning with
`/api` to:

``` text
http://127.0.0.1:8000
```

The backend must be running at that address for proxied API requests to
succeed. The frontend may load while API requests fail if the backend is
offline or listening on a different port.

Build the frontend:

``` powershell
npm run build
```

Run frontend tests:

``` powershell
npm test
```

Preview a production build:

``` powershell
npm run preview
```

## Run the backend

The backend entry point is `backend/app/main.py`.

Create and activate a virtual environment from the repository root:

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies using the package-management workflow specified by
the maintainers and `pyproject.toml`.

If `backend/app/main.py` exposes a standard ASGI application object
named `app`, and Uvicorn is installed, a typical local command is:

``` powershell
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Confirm the actual ASGI object, required environment variables, and
startup instructions in `backend/app/main.py` and `pyproject.toml`
before using this command. Keep the backend terminal running while
testing frontend features that call the API.

## API routes

The backend contains these route modules:

  Module                                      Purpose
  ------------------------------------------- ----------------------
  `backend/app/api/routes/health.py`          Health-check route
  `backend/app/api/routes/investigation.py`   Investigation routes

The frontend has been observed requesting:

-   `GET /api/health`
-   `GET /api/investigations?page=1&size=10`

Confirm the actual HTTP methods, route prefixes, request formats, and
response schemas in the backend route definitions. Those files are the
source of truth for the API contract.

## Database and migrations

The repository includes Alembic configuration and migration files.

Before applying migrations:

1.  Configure the database connection using the settings expected by the
    backend.
2.  Review the migration history and current database state.
3.  Follow the team's migration instructions.

Do not apply migrations to a shared or production database without
approval and an appropriate backup.

## Team workflow

The team uses separate development branches for parallel work,
including:

-   `frontend-dev` --- frontend development
-   `backend-dev` --- backend development

A typical update workflow is:

``` bash
git checkout frontend-dev
git pull origin frontend-dev
git status
```

Coordinate merges and pushes with the team. Resolve merge conflicts
carefully and review changes before committing.

## Security and responsible use

-   Use the project for authorized defensive security research and
    vulnerability assessment.
-   Treat external intelligence as evidence to verify, not as an
    automatic conclusion.
-   Never commit API keys, database credentials, or other secrets.
-   Keep local secret configuration out of version control.
-   Do not publish private vulnerability data or sensitive investigation
    records.
-   Verify findings against authoritative sources before making
    remediation or risk decisions.

## Development status

ThreatLens AI is under active development. The frontend, backend API,
integrations, database layer, and investigation workflow may evolve as
contributors implement and test features.

Bug reports, suggestions, and contributions can be coordinated through
the repository's issue and pull-request workflow.

------------------------------------------------------------------------

**Repository:** https://github.com/likhith07-pec/threatlens-ai
