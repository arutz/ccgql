package org.slashdev.demo.ccgql.model.entities

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.slashdev.demo.ccgql.model.common.City
import org.slashdev.demo.ccgql.model.tables.CityTable

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

