package org.slashdev.demo.ccgql.schema.entities

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.schema.tables.PersonTable

class PersonEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<PersonEntity>(PersonTable)

    var firstName by PersonTable.firstName
    var lastName by PersonTable.lastName
    var email by PersonTable.email
    var phone by PersonTable.phone
    var occupation by PersonTable.occupation
    var dateOfBirth by PersonTable.dateOfBirth

    fun toModel(): Person = Person(
        id = this.id.value,
        firstName = firstName,
        lastName = lastName,
        email = email,
        phone = phone,
        occupation = occupation,
        dateOfBirth = dateOfBirth,
    )
}

