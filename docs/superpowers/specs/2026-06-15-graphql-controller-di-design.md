# GraphQL controller dependency injection design

## Context

This repository demonstrates code-centric GraphQL with Expedia GraphQL Kotlin. The backend already uses Ktor's dependency plugin to provide infrastructure and repositories, but `configureGraphQl()` still resolves repositories directly and manually passes them into GraphQL query and mutation constructors.

The goal is to make GraphQL controllers participate in the same dependency framework as the repositories while keeping the demo explicit and easy to explain.

## Recommended approach

Register GraphQL query and mutation classes as Ktor DI-managed services.

Add a dedicated controller registration step, likely named `configureGraphQlControllers()`, that runs after repository registration and before GraphQL plugin installation. It should provide the concrete controller classes:

- `PersonQuery`
- `CityQuery`
- `AddressQuery`
- `PersonMutation`
- `CityMutation`
- `AddressMutation`

The controller constructors should stay explicit. For example, `PersonQuery` should still declare that it needs `PersonRepository` and `PersonSchemaSupport`. The improvement is that this construction happens in a DI registration module instead of inside `configureGraphQl()`.

## Alternatives considered

### DI-managed operation lists

Registering `List<Query>` and `List<Mutation>` would make `configureGraphQl()` resolve only two values. This is compact, but it hides which operations are installed and may be awkward with generic type keys in Ktor DI. It is less useful for a teaching/demo repository because the wiring becomes less visible.

### Separate factory function

A factory such as `createGraphQlQueries(dependencies)` would centralize assembly without making controllers DI-managed services. This would be a smaller change, but it would not fully align controllers with the repository/service dependency model.

## Architecture

The application startup order should make the dependency layers explicit:

1. `configurePostgres()` provides the database connection.
2. `configureDatabase()` initializes database tables.
3. `configureRepositories()` provides repository and schema-support services.
4. `configureGraphQlControllers()` provides GraphQL query and mutation services.
5. `configureGraphQl()` installs Expedia GraphQL Kotlin using the DI-managed controller instances.
6. `configureRooting()` installs the remaining routes.

With this structure, `configureGraphQl()` depends on GraphQL operation objects rather than repository internals.

## Components

`configureGraphQlControllers()` should live in the backend module package with the other Ktor setup functions. It should resolve the dependencies needed by each controller from Ktor DI, then provide each controller as a concrete service.

`configureGraphQl()` should resolve the concrete query and mutation classes from Ktor DI and pass those instances to Expedia's schema configuration:

- `queries = listOf(personQuery, cityQuery, addressQuery)`
- `mutations = listOf(personMutation, cityMutation, addressMutation)`

No resolver method names, GraphQL model types, or schema-generator hooks should change.

## Data flow

GraphQL request flow remains unchanged:

1. A client sends a request to `/graphql`.
2. Expedia GraphQL Kotlin dispatches to the matching query or mutation object.
3. The controller calls its repository or schema-support dependency.
4. The repository performs persistence work.
5. The controller returns the same GraphQL-facing model shape as before.

Only application assembly changes.

## Error handling

Missing DI bindings should fail at startup when controller or GraphQL plugin configuration resolves required dependencies. That is the preferred failure mode for this demo because configuration errors are visible immediately rather than delayed until a GraphQL request.

The design should not add broad catches or fallback controller construction. DI errors should surface directly.

## Testing

Existing GraphQL routing tests should continue to verify end-to-end GraphQL behavior through `/graphql`. Test setup should register mocked repositories and schema support through Ktor DI, call the new controller registration step, then call `configureGraphQl()`.

The schema should remain stable because the same controller classes and resolver methods are used. If a schema comparison or SDL snapshot is available later, it would be a useful guard, but this design does not require adding one.

## Non-goals

- No reflection-based controller discovery.
- No new dependency injection framework.
- No change to GraphQL operation names or model types.
- No frontend changes unless a future implementation unexpectedly changes the generated schema.
