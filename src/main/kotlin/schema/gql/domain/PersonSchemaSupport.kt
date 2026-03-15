package org.slashdev.demo.ccgql.schema.gql.domain

import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.repository.AddressRepository

class PersonSchemaSupport(
    private val addressRepository: AddressRepository,
) {
    fun addressesFor(personId: Int): List<Address> = addressRepository.findByPersonId(personId)
}

