\# Bookshelf

Bookshelf is a Go/Fiber REST API for managing the books that live on (or are waiting to reach) your personal shelves. The backend keeps track of books, their writers, and their categories, and exposes OpenAPI-documented CRUD endpoints backed by PostgreSQL migrations.

## Features
- CRUD endpoints for `books`, `categories`, and `writers` under `/api/v1/*`.
- Clean layering (`route -> service -> repository`) with DTO contracts and entities in `internal/`.
- PostgreSQL schema managed via `golang-migrate` and handy `just` recipes.
- Automatically generated OpenAPI spec (via `swag`) rendered with Scalar at `GET /docs`.
- Ready-to-run local environment using Docker Compose and `.env` driven configuration.

## Repository Layout
```
backend/
├── cmd/                # Application entrypoint (Fiber server + wiring)
├── internal/
│   ├── dto/            # Request/response contracts
│   ├── entity/         # Domain models (Book, Writer, Category, enums)
│   ├── repository/     # Data access interfaces (to be completed)
│   ├── route/          # HTTP handlers + swagger annotations
│   └── service/        # Coordinating business logic
├── docs/               # Generated OpenAPI artifacts served at /docs
├── migrations/         # SQL migrations for postgres
├── pkg/scalar/         # Minimal Scalar wrapper for serving the docs page
├── docker-compose.yaml # Local postgres
└── Justfile            # Developer automation
```

> **Status:** the routing and service layers are in place, while repository implementations still need to be filled in (they currently `panic`). Use the migrations and DTOs as the source of truth for payloads until persistence is wired up.

## Prerequisites
- Go 1.24+
- Docker + Docker Compose
- [`just`](https://github.com/casey/just) for running the provided recipes
- [`golang-migrate`](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate) CLI
- [`swag`](https://github.com/swaggo/swag) for regenerating the OpenAPI spec
- [`watchexec`](https://github.com/watchexec/watchexec) (optional, used by `just dev`)

## Environment Variables
Copy the example file and tweak as needed:

```bash
cp backend/.env.example backend/.env
```

| Variable      | Description                                | Default              |
| ------------- | ------------------------------------------ | -------------------- |
| `DATABASE_USER` | Postgres user                             | `postgres`           |
| `DATABASE_PASS` | Postgres password                         | `postgres`           |
| `DATABASE_HOST` | Hostname the Go app will use              | `0.0.0.0`            |
| `DATABASE_NAME` | Database name                             | `bookshelf`          |
| `DATABASE_URL`  | Full connection string used by sqlx/goqu | Derived from fields  |

`set dotenv-load` in the `Justfile` means `just <target>` automatically loads `.env`.

## Local Development
```bash
cd backend

# 1. Start the database
docker compose up -d postgres

# 2. Apply migrations (creates tables for writers, books, categories, and book-category pivot)
just migrate-up

# 3. Generate or refresh the swagger docs
just docs

# 4. Build and run the API
just build
just run      # or: just dev (auto rebuild + rerun on changes)
```

The server listens on `http://localhost:8000`. Verify it with:

```bash
just health    # wraps: curl -s http://localhost:8000/healthz | jq
```

### Useful `just` targets
| Command        | Description |
| -------------- | ----------- |
| `just format`  | gofumpt + goimports-reviser + golines over the repo |
| `just docs`    | Run `swag init` to rebuild the OpenAPI files under `docs/` |
| `just build`   | Compile `./cmd` into the `backend/main` binary |
| `just run`     | Execute the compiled binary |
| `just dev`     | Watch Go files (excluding `docs/`) and rebuild/run on change |
| `just migrate-create NAME=<slug>` | Scaffold a new timestamped SQL migration |
| `just migrate-up` | Apply pending migrations to the DB referenced by `DATABASE_URL` |
| `just health`  | Hit the `/healthz` endpoint |

## API Surface
Once you run `just docs`, visit `http://localhost:8000/docs` for the Scalar-rendered API reference. The generated swagger (located in `backend/docs/swagger.json`) documents the current request/response shapes:

- `GET /api/v1/books` – filter books by title, writer, status, or year.
- `GET /api/v1/books/{id}` – fetch a single book by ULID.
- `POST /api/v1/books` – create a book (`title`, `synopsis`, `writer`, `year`, `status`).
- `PUT /api/v1/books/{id}` – update book metadata.
- `DELETE /api/v1/books/{id}` – remove a book.
- `GET /api/v1/categories`, `POST /api/v1/categories`, etc. (similar CRUD pattern).
- `GET /api/v1/writers`, `POST /api/v1/writers`, etc.

Book statuses are modeled as `NOT_STARTED`, `WISHLIST`, `READING`, and `FINISHED` (`internal/entity/book.go`).

### Sample health check
```bash
curl http://localhost:8000/healthz
# => {"success":true,"message":"OK"}
```

## Database Schema
The SQL migrations under `backend/migrations/` create:

1. `categories` (name + timestamps)
2. `writers` (name, bio, birthdate)
3. `books` (title, synopsis, writer, status enum, etc.)
4. `book_category` (join table between books and categories)

These files are idempotent, so re-running `just migrate-up` is safe after new migrations land. When adding new tables or columns, prefer `just migrate-create NAME=<description>` to create paired `up`/`down` SQL files.

## Contributing
1. Keep swagger annotations up to date in the handlers under `internal/route`.
2. Run `just format` before opening a PR.
3. Fill in or extend repository implementations under `internal/repository`—the API is still a work-in-progress until those functions are completed and backed by queries.
4. Add tests under the relevant package (run with `go test ./...`; the `just test` recipe currently pins the nicer `gotestdox` output tool).

MIT License as referenced in the swagger metadata.
