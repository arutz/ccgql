# AGENTS.md

## Scope and precedence

- This file applies to the whole repository.
- For UI work in `frontend/ccgql-frontend/`, follow `frontend/ccgql-frontend/AGENTS.md` first (Angular-specific rules).
- Prefer small, focused changes; this repo is still scaffold-level in several areas.

## Big picture architecture

- Backend is a single Ktor app in `src/main/kotlin` with entrypoint `Application.module` in
  `src/main/kotlin/Application.kt`.
- Startup flow is explicit and ordered: `configurePostgres()` -> `configureDatabase()` -> `configureRepositories()` ->
  `configureGraphQl()` -> `configureRooting()`.
- DI is Ktor DI (`dependencies { provide<Database> { ... } }`) in `src/main/kotlin/module/Postgres.kt`.
- Persistence uses Exposed table definitions in `src/main/kotlin/schema/tables/` (`CityTable`, `AddressTable`,
  `PersonTable`).
- Repository access is split by technical cut: simple models in `src/main/kotlin/model/`, Exposed DAO entities in
  `src/main/kotlin/schema/entities/`, and repository interfaces/implementations in `src/main/kotlin/repository/` +
  `repository/exposed/`.
- `configureDatabase()` auto-creates missing tables at boot via Exposed schema APIs (
  `src/main/kotlin/module/Database.kt`).
- Backend routing is GraphQL-first: `configureGraphQl()` installs the GraphQL server, and `configureRooting()` exposes
  GraphiQL, SDL, and POST routes from `src/main/kotlin/module/Rooting.kt`.
- GraphQL operations are grouped by domain in `src/main/kotlin/controller/`, with each file containing both a `*Query`
  and
  matching `*Mutation` class.

## Integration points and runtime dependencies

- PostgreSQL is expected at `jdbc:postgresql://localhost:5432/ccgql` with `postgres/postgres` (hardcoded in
  `Postgres.kt`).
- Local DB container config is in `infrastructure/docker-compose.yml` (`postgres:16`, port `5432`).
- Ktor module wiring and server port are in `src/main/resources/application.yaml` (module + port `8080`).
- Frontend is a separate Angular app (`frontend/ccgql-frontend`) started independently (default port `4200`).
- Frontend Apollo client points at `http://localhost:8080/graphql` in `frontend/ccgql-frontend/src/app/app.config.ts`.
- GraphQL schema customization lives in `src/main/kotlin/schema/gql/` (`CustomScalars.kt`, `DateScalar.kt`,
  `UUIDScalar.kt`) and is wired into `configureGraphQl()` via `CustomSchemaGeneratorHooks`.
- Repository tests use in-memory H2 in PostgreSQL compatibility mode (`jdbc:h2:mem:...;MODE=PostgreSQL`) in
  `src/test/kotlin/org/slashdev/demo/ccgql/repository/exposed/ExposedRepositoriesTest.kt`, so backend tests do not
  require Docker Postgres.

## Developer workflows (verified from repo files)

- Backend build/test/run from repo root:
    - `./gradlew build`
    - `./gradlew test`
    - `./gradlew run`
- Backend fat jar/image tasks exist via Ktor plugin (`buildFatJar`, `buildImage`, `runDocker`) as documented in
  `README.md`.
- To update the graphql schema of the backend copy the output from a call to http://localhost:8080/sdl and paste it into
  the `frontend/ccgql-frontend/schema/schema.graphql` file. This will allow the frontend to generate types that
  are compatible with the backend schema.
- Start local Postgres from repo root:
    - `docker compose -f infrastructure/docker-compose.yml up -d`
- Frontend workflow from `frontend/ccgql-frontend/`:
    - `npm install`
    - `npm start` / `npm test` / `npm run build`
    - `npm run codegen` (regenerates `src/generated/graphql.ts` from `schema/schema.graphql` and
      `src/app/graphql/operations/**/*.ts`)

## Project-specific coding patterns

- Keep backend module setup split by concern in `src/main/kotlin/module/*.kt` (serialization, DB provider, schema
  bootstrap, routing).
- Keep backend persistence split by technical cut: table metadata in `schema/tables`, DAO mappings in `schema/entities`,
  transport/domain-shaped data classes in `model`, and persistence APIs in `repository`.
- Keep GraphQL wiring split by concern: server install in `src/main/kotlin/module/GraphQL.kt`, route exposure in
  `src/main/kotlin/module/Rooting.kt`, operations in `src/main/kotlin/controller/`, and custom scalar hooks in
  `src/main/kotlin/schema/gql/`.
- Add new DB structures as Exposed `Table` classes under `src/main/kotlin/schema/tables/` and include them in
  bootstrapping logic.
- For new persisted types, add both a simple `data class` model and a matching Exposed DAO-backed repository with
  `findAll`, `findById`, `create`, `update`, `delete`, and `save`.
- If a GraphQL-facing Kotlin type needs custom scalar handling (for example `Date` or `UUID`), register it through
  `src/main/kotlin/schema/gql/CustomScalars.kt`.
- SQL naming style is snake_case table/column names even though Kotlin properties are camelCase (example:
  `PersonTable`).
- Versions are managed in `gradle/libs.versions.toml`; add/upgrade backend deps there, not inline in `build.gradle.kts`.
- Frontend uses standalone Angular patterns and signals (see `frontend/ccgql-frontend/src/app/app.ts` and frontend
  `AGENTS.md`).
- Frontend GraphQL documents live in `frontend/ccgql-frontend/src/app/graphql/operations/`, generated Apollo Angular
  types/services in `frontend/ccgql-frontend/src/generated/graphql.ts`, and thin app-facing wrappers in
  `frontend/ccgql-frontend/src/app/graphql/*-api.service.ts`.

## Known gaps agents should account for

- GraphQL subscriptions are not implemented yet (`subscriptions = listOf()` in `src/main/kotlin/module/GraphQL.kt`).
- Backend Kotlin tests exist, but coverage is still narrow:
  `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt` focuses on GraphQL routes/custom `Date` scalar
  handling and `repository/exposed/ExposedRepositoriesTest.kt` focuses on repository CRUD.
- Root `README.md` is mostly generator text; rely on source files for current behavior when docs and code diverge.

