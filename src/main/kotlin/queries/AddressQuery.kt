package org.slashdev.demo.ccgql.queries

import com.expediagroup.graphql.server.operations.Mutation
import com.expediagroup.graphql.server.operations.Query
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.repository.AddressRepository

@Suppress("unused") // endpoint for gql
class AddressQuery(val addressRepository: AddressRepository) : Query {
    fun findAddress(id: Int): Address? =
        addressRepository.findById(id)

    fun listAddresses(): List<Address> = addressRepository.findAll()
}

@Suppress("unused") // endpoint for gql
class AddressMutation(val addressRepository: AddressRepository) : Mutation {
    fun saveAddress(person: Address) = addressRepository.save(person)

    fun deleteAddress(id: Int) = addressRepository.delete(id)
}