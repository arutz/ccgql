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