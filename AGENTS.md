# AGENTS.md

## Scope and precedence

- This file applies to the whole repository.
- For frontend work in `frontend/ccgql-frontend/`, also apply `frontend/ccgql-frontend/AGENTS.md` (Angular-specific coding rules).
- Prefer small, focused changes.

## Architecture overview

Demo repository for **"Code-centric GraphQL"**: the GraphQL schema is generated
automatically from Kotlin backend code (single source of truth). The Angular
frontend then generates TypeScript types and Apollo services from that schema.

```
Kotlin Code  →  GraphQL Kotlin Framework  →  GraphQL Schema (SDL)
                                                      ↓
                                          graphql-codegen (Angular)
                                                      ↓
                                  TypeScript Types  →  Apollo Angular Services
```

### Backend (`src/main/kotlin/`)

Ktor app with **GraphQL Kotlin (Expedia)** for schema generation and serving,
**Exposed ORM** for persistence against **PostgreSQL 16**.

| Folder | Purpose |
|---|---|
| `module/` | Ktor plugin setup (DB, GraphQL server, routing, CORS) |
| `controller/` | GraphQL `*Query` + `*Mutation` class pairs per domain |
| `model/` | Domain data classes and custom GraphQL scalars |
| `repository/` | Repository interfaces + Exposed implementations |
| `schema/tables/` | Exposed Table definitions (snake_case column names) |
| `schema/entities/` | Exposed DAO entity mappings |

### Frontend (`frontend/ccgql-frontend/`)

Angular app with **Apollo Angular** as GraphQL client.

| Folder / File | Purpose |
|---|---|
| `src/app/graphql/operations/` | GQL query/mutation documents per domain |
| `src/app/graphql/*-api.service.ts` | Thin app-facing wrappers around generated services |
| `src/generated/graphql.ts` | **Generated – do not edit manually** |
| `schema/schema.graphql` | Local copy of the backend SDL |

## Runtime dependencies

- PostgreSQL at `jdbc:postgresql://localhost:5432/ccgql` (user/password: `postgres/postgres`)
- Start DB: `docker compose -f infrastructure/docker-compose.yml up -d`
- Backend runs on port `8080`, frontend on port `4200`
- Apollo client target: `http://localhost:8080/graphql` (configured in `src/app/app.config.ts`)

## Development cycle

### Backend

```bash
# From repo root
./gradlew run        # start backend (port 8080)
./gradlew test       # run tests (no Docker required – uses in-memory H2)
./gradlew build      # compile and package
```

### Schema → Frontend sync

Run this after **any backend change** that affects the GraphQL schema:

```bash
# 1. Fetch updated SDL from running backend
curl http://localhost:8080/sdl > frontend/ccgql-frontend/schema/schema.graphql

# 2. Regenerate TypeScript types and Apollo services
cd frontend/ccgql-frontend && npm run codegen
```

`npm run codegen` reads `schema/schema.graphql` and all
`src/app/graphql/operations/**/*.ts` files, and writes `src/generated/graphql.ts`.

### Frontend

```bash
cd frontend/ccgql-frontend
npm install
npm start        # dev server at http://localhost:4200
npm test
npm run build
```

## Coding conventions

### Backend

- New domain: add Exposed `Table` → `schema/tables/`, DAO entity → `schema/entities/`, data class → `model/`, repository interface + Exposed impl → `repository/`.
- GraphQL queries and mutations go in `controller/` as `*Query` / `*Mutation` class pairs per domain.
- Custom GraphQL scalars (e.g. `UUID`, `Date`) are registered in `src/main/kotlin/schema/gql/CustomScalars.kt`.
- Table/column names are snake_case; Kotlin properties are camelCase.
- Dependency versions go in `gradle/libs.versions.toml`, not inline in `build.gradle.kts`.

### Frontend

- See `frontend/ccgql-frontend/AGENTS.md` for Angular-specific coding rules.
- New GQL operations go in `src/app/graphql/operations/` as typed documents.
- After adding or changing operations, run `npm run codegen`.
- Expose generated services to the app via `*-api.service.ts` wrappers.

## Known gaps

- GraphQL subscriptions are not yet implemented.
- Test coverage is narrow – existing tests cover GraphQL routing and repository CRUD.
