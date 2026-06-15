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
