package org.slashdev.demo.ccgql.schema.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.slashdev.demo.ccgql.model.Occupation

object PersonTable : IntIdTable("person") {
    val firstName = varchar("first_name", 255)
    val lastName = varchar("last_name", 255)
    val email = varchar("email", 255)
    val phone = varchar("phone", 255)
    val occupation = enumeration("occupation", Occupation::class)
    val dateOfBirth = long("date_of_birth") // UTC timestamp
}