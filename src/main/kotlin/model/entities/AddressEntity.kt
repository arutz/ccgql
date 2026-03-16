package org.slashdev.demo.ccgql.model.entities

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.slashdev.demo.ccgql.model.common.Address
import org.slashdev.demo.ccgql.model.tables.AddressTable

class AddressEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<AddressEntity>(AddressTable)

    var person by PersonEntity referencedOn AddressTable.personId
    var street by AddressTable.street
    var city by CityEntity referencedOn AddressTable.cityId
    var state by AddressTable.state
    var zipCode by AddressTable.zipCode

    fun toModel(): Address = Address(
        id = this.id.value,
        personId = person.id.value,
        street = street,
        cityId = city.id.value,
        state = state,
        zipCode = zipCode,
    )
}

