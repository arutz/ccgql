package org.slashdev.demo.ccgql.module

import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.repository.exposed.ExposedAddressRepository
import org.slashdev.demo.ccgql.repository.exposed.ExposedCityRepository
import org.slashdev.demo.ccgql.repository.exposed.ExposedPersonRepository
import org.slashdev.demo.ccgql.schema.gql.domain.PersonSchemaSupport

fun Application.configureRepositories() {
    val database: Database by dependencies
    val addressRepository: AddressRepository by dependencies

    dependencies {
        provide<CityRepository> { ExposedCityRepository(database) }
        provide<PersonRepository> { ExposedPersonRepository(database) }
        provide<AddressRepository> { ExposedAddressRepository(database) }
        provide<PersonSchemaSupport> { PersonSchemaSupport(addressRepository) }
    }
}

