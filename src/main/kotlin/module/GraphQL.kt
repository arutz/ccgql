package org.slashdev.demo.ccgql.module

import com.expediagroup.graphql.server.ktor.GraphQL
import com.expediagroup.graphql.server.ktor.defaultGraphQLStatusPages
import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import io.ktor.server.plugins.statuspages.*
import org.slashdev.demo.ccgql.queries.*
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.schema.gql.CustomSchemaGeneratorHooks

fun Application.configureGraphQl() {

    val personRepository: PersonRepository by dependencies
    val cityRepository: CityRepository by dependencies
    val addressRepository: AddressRepository by dependencies

    install(GraphQL) {
        schema {
            packages = listOf("org.slashdev.demo.ccgql.model")
            queries = listOf(PersonQuery(personRepository), CityQuery(cityRepository), AddressQuery(addressRepository))
            mutations = listOf(
                PersonMutation(personRepository), CityMutation(cityRepository),
                AddressMutation(addressRepository)
            )
            subscriptions = listOf() // erst mal nicht relevant
            hooks = CustomSchemaGeneratorHooks
        }
        // TODO: data fetching environment mit Zugriff auf unsere Dependencies (z.B. Database) bereitstellen
    }
    install(StatusPages) {
        defaultGraphQLStatusPages()
    }
}