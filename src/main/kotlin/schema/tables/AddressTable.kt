package org.slashdev.demo.ccgql.schema.tables

import org.jetbrains.exposed.dao.id.IntIdTable

object AddressTable : IntIdTable("address") {
    val personId = reference("person_id", PersonTable)
    val street = varchar("street", 255)
    val cityId = reference("city_id", CityTable)
    val state = varchar("state", 255)
    val zipCode = varchar("zip_code", 20)
}