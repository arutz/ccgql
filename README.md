# ccgql – Code-centric GraphQL Demo

Demo-Repository zur Präsentation **"Codecentric GraphQL"** – zeigt, wie ein
GraphQL-Schema direkt aus dem Kotlin-Code generiert wird und Clients (hier: ein
Angular-Frontend) daraus typisierte Clients erzeugen können.

---

## Big Picture Architektur

```
┌──────────────────────────────────────────────────────────────────┐
│                          Backend (Ktor)                          │
│                                                                  │
│  Kotlin Code  ──►  GraphQL-Kotlin-Framework  ──►  GraphQL Schema │
│                                                    │             │
│                                               GraphQL API        │
│                                             (POST /graphql)      │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ Schema (SDL)
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Frontend (Angular)                         │
│                                                                  │
│  Schema  ──►  graphql-codegen  ──►  TypeScript-Typen             │
│                                       │                          │
│                                  GQL Operations                  │
│                                       │                          │
│                               Apollo Angular Services            │
└──────────────────────────────────────────────────────────────────┘
```

Der **Codecentric-Ansatz**:
- Das Backend ist die *Single Source of Truth* – das Schema entsteht automatisch
  aus Kotlin-Klassen und -Funktionen (keine manuelle SDL-Pflege).
- Das Frontend generiert via `graphql-codegen` typisierte Angular-Services aus
  dem Schema – Ende-zu-Ende-Typsicherheit ohne Handarbeit.

---

## Tech-Stack Backend

| Bereich | Technologie |
|---|---|
| Sprache | Kotlin |
| Server-Plattform | [Ktor](https://ktor.io/) |
| GraphQL Codegen / API | [GraphQL Kotlin (Expedia)](https://opensource.expediagroup.com/graphql-kotlin/docs/) |
| Persistenz ORM | [Exposed](https://github.com/JetBrains/Exposed) |
| Datenbank | PostgreSQL 16 |
| Dependency Injection | Ktor DI |

---

## Projekt-Struktur

```
src/main/kotlin/
├── Application.kt              # Einstiegspunkt & Modulreihenfolge
├── module/
│   ├── Postgres.kt             # DB-Verbindung & DI-Registrierung
│   ├── Database.kt             # Exposed-Schema-Bootstrap (auto-create)
│   ├── Repositories.kt         # Repository-DI-Registrierung
│   ├── GraphQL.kt              # GraphQL-Server-Installation
│   ├── Rooting.kt              # HTTP-Routen (GraphiQL, SDL, POST)
│   └── Cors.kt                 # CORS-Konfiguration
├── controller/
│   ├── PersonController.kt     # PersonQuery + PersonMutation
│   ├── CityController.kt       # CityQuery + CityMutation
│   └── AddressController.kt    # AddressQuery + AddressMutation
├── model/
│   ├── common/                 # Domänen-Datenklassen (transport-shaped)
│   └── gql/                    # Custom Scalars & Schema-Hooks
├── repository/
│   ├── *Repository.kt          # Repository-Interfaces
│   └── exposed/                # Exposed DAO-Implementierungen
└── schema/
    ├── tables/                 # Exposed Table-Definitionen (snake_case)
    └── entities/               # Exposed DAO-Entities
```

### Startup-Reihenfolge (`Application.module`)

```
configurePostgres()
  └─► configureDatabase()       # Tabellen auto-create via Exposed
        └─► configureRepositories()
              └─► configureGraphQl()
                    └─► configureRooting()
```

---

## Endpunkte

| URL | Beschreibung |
|---|---|
| `POST http://localhost:8080/graphql` | GraphQL API |
| `GET  http://localhost:8080/graphiql` | GraphiQL Playground |
| `GET  http://localhost:8080/sdl` | GraphQL Schema (SDL) |

---

## Voraussetzungen

- JDK 17+
- Docker (für lokale PostgreSQL-Instanz)

### PostgreSQL starten

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

Die Datenbank ist unter `jdbc:postgresql://localhost:5432/ccgql` erreichbar
(User/Passwort: `postgres/postgres`).

---

## Build & Run

| Befehl | Beschreibung |
|---|---|
| `./gradlew run` | Server starten (Port 8080) |
| `./gradlew test` | Tests ausführen |
| `./gradlew build` | Projekt bauen |
| `./gradlew buildFatJar` | Ausführbares Fat-JAR erzeugen |
| `./gradlew buildImage` | Docker-Image bauen |
| `./gradlew runDocker` | Via lokalem Docker-Image starten |

---

## Schema-Synchronisation mit dem Frontend

Nach Änderungen am Backend-Schema das SDL ins Frontend übertragen:

```bash
# Backend läuft auf :8080
curl http://localhost:8080/sdl > frontend/ccgql-frontend/schema/schema.graphql
```

Anschließend im Frontend `npm run codegen` ausführen, um TypeScript-Typen neu
zu generieren.

---

## Frontend

Das Angular-Frontend liegt unter [`frontend/ccgql-frontend/`](./frontend/ccgql-frontend/).
Dort befindet sich eine eigene [`README.md`](./frontend/ccgql-frontend/README.md) mit
allen Frontend-spezifischen Informationen.
