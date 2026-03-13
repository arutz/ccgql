package org.slashdev.demo.ccgql.schema.entities

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.slashdev.demo.ccgql.model.City
import org.slashdev.demo.ccgql.schema.tables.CityTable

class CityEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<CityEntity>(CityTable)

    var name by CityTable.name
    var country by CityTable.country

    fun toModel(): City = City(
        id = this.id.value,
        name = name,
        country = country,
    )
}

