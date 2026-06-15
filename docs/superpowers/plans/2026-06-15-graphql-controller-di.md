# GraphQL Controller DI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make GraphQL query and mutation controllers Ktor DI-managed services while preserving the existing GraphQL schema and resolver behavior.

**Architecture:** Add a dedicated `configureGraphQlControllers()` Ktor module that registers concrete query and mutation controller instances from repository services. Refactor `configureGraphQl()` so it resolves controller instances from DI instead of resolving repositories and constructing controllers inline.

**Tech Stack:** Kotlin 2.3, Ktor 3.4 dependency plugin, Expedia GraphQL Kotlin 9.0, MockK, Ktor test host, Gradle.

---

## File structure

- Create: `src/main/kotlin/module/GraphQlControllers.kt`
  - Responsibility: register GraphQL `Query` and `Mutation` controller classes as concrete Ktor DI services.
- Modify: `src/main/kotlin/Application.kt`
  - Responsibility: call `configureGraphQlControllers()` after repository registration and before GraphQL plugin installation.
- Modify: `src/main/kotlin/module/GraphQL.kt`
  - Responsibility: install Expedia GraphQL Kotlin using DI-resolved controller instances only.
- Modify: `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt`
  - Responsibility: route tests continue to exercise real GraphQL execution, and one wiring test proves `configureGraphQl()` depends on controller bindings rather than repository bindings.

## Task 1: Register GraphQL controllers in Ktor DI

**Files:**
- Modify: `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt:67-87`
- Create: `src/main/kotlin/module/GraphQlControllers.kt`
- Modify: `src/main/kotlin/Application.kt:10-17`
- Test: `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt`

- [ ] **Step 1: Update the existing test application wiring to call the new controller registration step**

Replace `configureTestGraphQlApp()` with this version:

```kotlin
    private fun Application.configureTestGraphQlApp(
        personRepository: PersonRepository = createPersonRepositoryMock(),
        cityRepository: CityRepository = mockk(relaxed = true),
        addressRepository: AddressRepository = mockk {
            every { findByPersonId(existingPersonBase.id!!) } returns listOf(existingAddress)
            every { findByPersonId(match { it != existingPersonBase.id }) } returns emptyList()
        },
    ) {
        val personSchemaSupport = PersonSchemaSupport(addressRepository)

        dependencies {
            provide<PersonRepository> { personRepository }
            provide<CityRepository> { cityRepository }
            provide<AddressRepository> { addressRepository }
            provide<PersonSchemaSupport> { personSchemaSupport }
        }

        configureGraphQlControllers()
        configureCors()
        configureGraphQl()
        configureRooting()
    }
```

- [ ] **Step 2: Run the routing tests and verify the expected failure**

Run:

```bash
./gradlew test --tests org.slashdev.demo.ccgql.module.GraphQLRoutingTest
```

Expected: compilation fails because `configureGraphQlControllers()` does not exist yet. The useful failure is an unresolved reference in `GraphQLRoutingTest.kt`.

- [ ] **Step 3: Create the controller DI module**

Create `src/main/kotlin/module/GraphQlControllers.kt`:

```kotlin
package org.slashdev.demo.ccgql.module

import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import org.slashdev.demo.ccgql.controller.AddressMutation
import org.slashdev.demo.ccgql.controller.AddressQuery
import org.slashdev.demo.ccgql.controller.CityMutation
import org.slashdev.demo.ccgql.controller.CityQuery
import org.slashdev.demo.ccgql.controller.PersonMutation
import org.slashdev.demo.ccgql.controller.PersonQuery
import org.slashdev.demo.ccgql.model.gql.schema.PersonSchemaSupport
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.repository.PersonRepository

fun Application.configureGraphQlControllers() {
    val personRepository: PersonRepository by dependencies
    val cityRepository: CityRepository by dependencies
    val addressRepository: AddressRepository by dependencies
    val personSchemaSupport: PersonSchemaSupport by dependencies

    dependencies {
        provide<PersonQuery> { PersonQuery(personRepository, personSchemaSupport) }
        provide<CityQuery> { CityQuery(cityRepository) }
        provide<AddressQuery> { AddressQuery(addressRepository) }
        provide<PersonMutation> { PersonMutation(personRepository, personSchemaSupport) }
        provide<CityMutation> { CityMutation(cityRepository) }
        provide<AddressMutation> { AddressMutation(addressRepository) }
    }
}
```

- [ ] **Step 4: Register controllers during application startup**

Replace `Application.module()` in `src/main/kotlin/Application.kt` with:

```kotlin
fun Application.module() {
    configurePostgres()
    configureDatabase()
    configureRepositories()
    configureGraphQlControllers()
    configureCors()
    configureGraphQl()
    configureRooting()
}
```

- [ ] **Step 5: Run the routing tests and verify behavior still passes**

Run:

```bash
./gradlew test --tests org.slashdev.demo.ccgql.module.GraphQLRoutingTest
```

Expected: tests pass. At this point, controller services are registered, but `configureGraphQl()` may still construct controllers manually.

- [ ] **Step 6: Commit the controller registration change**

Run:

```bash
git add src/main/kotlin/module/GraphQlControllers.kt src/main/kotlin/Application.kt src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt
git commit -m "feat: register graphql controllers in di" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: Make GraphQL plugin setup consume controller bindings

**Files:**
- Modify: `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt:1-218`
- Modify: `src/main/kotlin/module/GraphQL.kt:1-41`

- [ ] **Step 1: Add controller imports to the routing test**

Add this import with the other imports in `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt`:

```kotlin
import org.slashdev.demo.ccgql.controller.*
```

- [ ] **Step 2: Add a failing test proving `configureGraphQl()` uses controller bindings**

Insert this test after `testGraphQlApplication()` and before `graphiqlRouteReturnsHtml()`:

```kotlin
    @Test
    fun graphqlConfigurationUsesControllerBindings() = testGraphQlApplication {
        val personRepository = createPersonRepositoryMock()
        val cityRepository = mockk<CityRepository>(relaxed = true)
        val addressRepository = mockk<AddressRepository> {
            every { findByPersonId(existingPersonBase.id!!) } returns listOf(existingAddress)
            every { findByPersonId(match { it != existingPersonBase.id }) } returns emptyList()
        }
        val personSchemaSupport = PersonSchemaSupport(addressRepository)

        application {
            dependencies {
                provide<PersonQuery> { PersonQuery(personRepository, personSchemaSupport) }
                provide<CityQuery> { CityQuery(cityRepository) }
                provide<AddressQuery> { AddressQuery(addressRepository) }
                provide<PersonMutation> { PersonMutation(personRepository, personSchemaSupport) }
                provide<CityMutation> { CityMutation(cityRepository) }
                provide<AddressMutation> { AddressMutation(addressRepository) }
            }

            configureGraphQl()
            configureRooting()
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""{"query":"query { listPersons { id firstName addresses { street } } }"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val payload = objectMapper.readTree(response.bodyAsText())
        assertEquals("Ada", payload.at("/data/listPersons/0/firstName").asText())
        assertEquals("Analytical Engine Street 1", payload.at("/data/listPersons/0/addresses/0/street").asText())
    }
```

- [ ] **Step 3: Run the new test and verify the expected failure**

Run:

```bash
./gradlew test --tests org.slashdev.demo.ccgql.module.GraphQLRoutingTest.graphqlConfigurationUsesControllerBindings
```

Expected: test fails during application setup because the current `configureGraphQl()` still resolves `PersonRepository`, `CityRepository`, `AddressRepository`, and `PersonSchemaSupport` from DI instead of resolving controller instances.

- [ ] **Step 4: Refactor `configureGraphQl()` to resolve controller services**

Replace `src/main/kotlin/module/GraphQL.kt` with:

```kotlin
package org.slashdev.demo.ccgql.module

import com.expediagroup.graphql.server.ktor.GraphQL
import com.expediagroup.graphql.server.ktor.defaultGraphQLStatusPages
import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import io.ktor.server.plugins.statuspages.*
import org.slashdev.demo.ccgql.controller.AddressMutation
import org.slashdev.demo.ccgql.controller.AddressQuery
import org.slashdev.demo.ccgql.controller.CityMutation
import org.slashdev.demo.ccgql.controller.CityQuery
import org.slashdev.demo.ccgql.controller.PersonMutation
import org.slashdev.demo.ccgql.controller.PersonQuery
import org.slashdev.demo.ccgql.model.gql.CustomSchemaGeneratorHooks

fun Application.configureGraphQl() {
    val personQuery: PersonQuery by dependencies
    val cityQuery: CityQuery by dependencies
    val addressQuery: AddressQuery by dependencies
    val personMutation: PersonMutation by dependencies
    val cityMutation: CityMutation by dependencies
    val addressMutation: AddressMutation by dependencies

    install(GraphQL) {
        schema {
            packages = listOf("org.slashdev.demo.ccgql.model.common", "org.slashdev.demo.ccgql.model.gql.schema")
            queries = listOf(
                personQuery,
                cityQuery,
                addressQuery
            )
            mutations = listOf(
                personMutation,
                cityMutation,
                addressMutation
            )
            subscriptions = listOf() // erst mal nicht relevant
            hooks = CustomSchemaGeneratorHooks
        }
    }
    install(StatusPages) {
        defaultGraphQLStatusPages()
    }
}
```

- [ ] **Step 5: Run the new test and verify it passes**

Run:

```bash
./gradlew test --tests org.slashdev.demo.ccgql.module.GraphQLRoutingTest.graphqlConfigurationUsesControllerBindings
```

Expected: test passes with HTTP 200 and the expected `Ada` and address values in the GraphQL response.

- [ ] **Step 6: Run all routing tests**

Run:

```bash
./gradlew test --tests org.slashdev.demo.ccgql.module.GraphQLRoutingTest
```

Expected: all non-ignored tests in `GraphQLRoutingTest` pass.

- [ ] **Step 7: Commit the GraphQL setup refactor**

Run:

```bash
git add src/main/kotlin/module/GraphQL.kt src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt
git commit -m "refactor: resolve graphql controllers from di" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 3: Final verification

**Files:**
- Verify: `src/main/kotlin/module/GraphQlControllers.kt`
- Verify: `src/main/kotlin/module/GraphQL.kt`
- Verify: `src/main/kotlin/Application.kt`
- Verify: `src/test/kotlin/org/slashdev/demo/ccgql/module/GraphQLRoutingTest.kt`

- [ ] **Step 1: Run the full backend test suite**

Run:

```bash
./gradlew test
```

Expected: the backend test suite passes.

- [ ] **Step 2: Run the backend build**

Run:

```bash
./gradlew build
```

Expected: the project compiles, tests run successfully as part of the build, and Gradle reports `BUILD SUCCESSFUL`.

- [ ] **Step 3: Check the working tree**

Run:

```bash
git --no-pager status --short
```

Expected: only unrelated pre-existing untracked files may remain. The implementation files should be committed.

- [ ] **Step 4: Confirm the final architecture in code review**

Check these conditions before handing off:

```text
Application.module calls configureGraphQlControllers() after configureRepositories().
GraphQlControllers.kt provides PersonQuery, CityQuery, AddressQuery, PersonMutation, CityMutation, and AddressMutation.
GraphQL.kt imports controller classes and does not import repository interfaces or PersonSchemaSupport.
GraphQLRoutingTest has a test named graphqlConfigurationUsesControllerBindings.
```

Expected: all four conditions are true.
