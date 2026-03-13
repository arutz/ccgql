package org.slashdev.demo.ccgql.module

import com.expediagroup.graphql.server.ktor.GraphQL
import com.expediagroup.graphql.server.ktor.defaultGraphQLStatusPages
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import org.slashdev.demo.ccgql.routes.queries.PersonQuery

fun Application.configureGraphQl() {
    install(GraphQL) {
        schema {
            packages = listOf("org.slashdev.demo.ccgql.schema.gql", "org.slashdev.demo.ccgql.model")
            queries = listOf(PersonQuery())
            mutations = listOf()
            subscriptions = listOf()
        }
        // TODO: data fetching environment mit Zugriff auf unsere Dependencies (z.B. Database) bereitstellen
    }
    install(StatusPages) {
        defaultGraphQLStatusPages()
    }
}