# ccgql – Frontend (Angular)

Angular-Frontend des Demo-Projekts **"Codecentric GraphQL"**.  
Es konsumiert die Backend-GraphQL-API und zeigt den vollständigen
Code-centric Ansatz: Schema → Codegen → typisierte Angular-Services.

Zum Gesamtprojekt: [`../../README.md`](../../README.md)

---

## Big Picture (Frontend-Sicht)

```
Backend SDL (http://localhost:8080/sdl)
        │
        ▼
schema/schema.graphql        ◄── manuell per curl aktualisieren
        │
        ▼
graphql-codegen
        │
        ▼
src/generated/graphql.ts     ◄── generierte Typen & Apollo-Services
        │
        ├─► src/app/graphql/*-api.service.ts   ◄── App-facing Wrapper
        │
        └─► src/app/**/*.ts                    ◄── Angular Components
```

---

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Sprache / Framework | TypeScript / [Angular](https://angular.dev) |
| GraphQL Client | [Apollo Angular](https://www.apollographql.com/docs/angular/) |
| Codegen | [graphql-codegen](https://the-guild.dev/graphql/codegen) |
| State Management | Angular Signals |
| Change Detection | `OnPush` |

---

## Projekt-Struktur

```
src/
├── app/
│   ├── app.ts / app.config.ts / app.routes.ts   # App-Einstieg & Apollo-Konfiguration
│   ├── graphql/
│   │   ├── operations/          # GQL-Dokumente (Queries & Mutations)
│   │   │   ├── person-operations.ts
│   │   │   ├── city-operations.ts
│   │   │   ├── address-operations.ts
│   │   │   └── home-operations.ts
│   │   ├── person-api.service.ts   # App-facing Wrapper-Services
│   │   ├── city-api.service.ts
│   │   ├── address-api.service.ts
│   │   └── home-api.service.ts
│   ├── home/                    # Home-Feature (Übersichtsseite)
│   ├── person-detail/           # Person-Detail-Feature (CRUD)
│   └── city-detail/             # City-Detail-Feature (CRUD)
├── generated/
│   └── graphql.ts               # ⚡ Generiert – nicht manuell bearbeiten!
└── styles.css
schema/
└── schema.graphql               # Vom Backend übernommenes SDL
```

---

## Entwicklung

### Voraussetzungen

- Node.js 20+
- Laufendes Backend auf `http://localhost:8080`

### Installation & Start

```bash
npm install
npm start          # Dev-Server auf http://localhost:4200
```

### Tests

```bash
npm test
```

### Produktions-Build

```bash
npm run build      # Artefakte in dist/
```

---

## Schema & Codegen-Workflow

Wenn sich das Backend-Schema ändert, muss die lokale Schema-Datei
aktualisiert und der Codegen erneut ausgeführt werden:

```bash
# 1. Schema vom laufenden Backend holen
curl http://localhost:8080/sdl > schema/schema.graphql

# 2. TypeScript-Typen und Apollo-Services neu generieren
npm run codegen
```

Die generierten Typen landen in `src/generated/graphql.ts` und werden
von den `*-api.service.ts`-Wrappern verwendet.

---

## Apollo Client Konfiguration

Der Apollo Client ist in `src/app/app.config.ts` konfiguriert und zeigt
auf `http://localhost:8080/graphql`.
