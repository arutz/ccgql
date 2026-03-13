# AGENTS.md

## Scope and precedence
- This file applies to the whole repository.
- For UI work in `frontend/ccgql-frontend/`, follow `frontend/ccgql-frontend/AGENTS.md` first (Angular-specific rules).
- Prefer small, focused changes; this repo is still scaffold-level in several areas.

## Big picture architecture
- Backend is a single Ktor app in `src/main/kotlin` with entrypoint `Application.module` in `src/main/kotlin/Application.kt`.
- Startup flow is explicit and ordered: `configureSerialization()` -> `configurePostgres()` -> `configureDatabase()` -> `configureRepositories()` -> `configureRouting()`.
- DI is Ktor DI (`dependencies { provide<Database> { ... } }`) in `src/main/kotlin/module/Postgres.kt`.
- Persistence uses Exposed table definitions in `src/main/kotlin/schema/tables/` (`CityTable`, `AddressTable`, `PersonTable`).
- Repository access is split by technical cut: simple models in `src/main/kotlin/model/`, Exposed DAO entities in `src/main/kotlin/schema/entities/`, and repository interfaces/implementations in `src/main/kotlin/repository/` + `repository/exposed/`.
- `configureDatabase()` auto-creates missing tables at boot via Exposed schema APIs (`src/main/kotlin/module/Database.kt`).
- HTTP routes are not implemented yet (`src/main/kotlin/module/Routing.kt` is empty).

## Integration points and runtime dependencies
- PostgreSQL is expected at `jdbc:postgresql://localhost:5432/ccgql` with `postgres/postgres` (hardcoded in `Postgres.kt`).
- Local DB container config is in `infrastructure/docker-compose.yml` (`postgres:16`, port `5432`).
- Ktor module wiring and server port are in `src/main/resources/application.yaml` (module + port `8080`).
- Frontend is a separate Angular app (`frontend/ccgql-frontend`) started independently (default port `4200`).

## Developer workflows (verified from repo files)
- Backend build/test/run from repo root:
  - `./gradlew build`
  - `./gradlew test`
  - `./gradlew run`
- Backend fat jar/image tasks exist via Ktor plugin (`buildFatJar`, `buildImage`, `runDocker`) as documented in `README.md`.
- Start local Postgres from repo root:
  - `docker compose -f infrastructure/docker-compose.yml up -d`
- Frontend workflow from `frontend/ccgql-frontend/`:
  - `npm install`
  - `npm start` / `npm test` / `npm run build`

## Project-specific coding patterns
- Keep backend module setup split by concern in `src/main/kotlin/module/*.kt` (serialization, DB provider, schema bootstrap, routing).
- Keep backend persistence split by technical cut: table metadata in `schema/tables`, DAO mappings in `schema/entities`, transport/domain-shaped data classes in `model`, and persistence APIs in `repository`.
- Add new DB structures as Exposed `Table` classes under `src/main/kotlin/schema/tables/` and include them in bootstrapping logic.
- For new persisted types, add both a simple `data class` model and a matching Exposed DAO-backed repository with `findAll`, `findById`, `create`, `update`, `delete`, and `save`.
- SQL naming style is snake_case table/column names even though Kotlin properties are camelCase (example: `PersonTable`).
- Versions are managed in `gradle/libs.versions.toml`; add/upgrade backend deps there, not inline in `build.gradle.kts`.
- Frontend uses standalone Angular patterns and signals (see `frontend/ccgql-frontend/src/app/app.ts` and frontend `AGENTS.md`).

## Known gaps agents should account for
- `src/main/kotlin/schema/gql/` is currently empty despite project naming suggesting GraphQL.
- Backend has no Kotlin test sources yet; if adding backend features, include tests and test scaffolding paths.
- Root `README.md` is mostly generator text; rely on source files for current behavior when docs and code diverge.

