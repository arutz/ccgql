package org.slashdev.demo.ccgql.model.gql.schema

import org.slashdev.demo.ccgql.model.common.Address
import org.slashdev.demo.ccgql.repository.AddressRepository

class PersonSchemaSupport(
    private val addressRepository: AddressRepository,
) {
    fun addressesFor(personId: Int): List<Address> = addressRepository.findByPersonId(personId)
}

