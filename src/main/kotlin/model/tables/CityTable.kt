package org.slashdev.demo.ccgql.model.tables

import org.jetbrains.exposed.dao.id.IntIdTable

object CityTable : IntIdTable("city") {
    val name = varchar("name", 255)
    val country = varchar("country", 255)
}