package org.slashdev.demo.ccgql.model.entities

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.slashdev.demo.ccgql.model.common.Person
import org.slashdev.demo.ccgql.model.common.PersonBase
import org.slashdev.demo.ccgql.model.tables.PersonTable
import java.util.*

class PersonEntity(id: EntityID<Int>) : IntEntity(id), Person<EntityID<Int>, Long> {
    companion object : IntEntityClass<PersonEntity>(PersonTable)

    override var firstName by PersonTable.firstName
    override var lastName by PersonTable.lastName
    override var email by PersonTable.email
    override var phone by PersonTable.phone
    override var occupation by PersonTable.occupation
    override var dateOfBirth by PersonTable.dateOfBirth

    fun toModel(): PersonBase = PersonBase(
        id = this.id.value,
        firstName = firstName,
        lastName = lastName,
        email = email,
        phone = phone,
        occupation = occupation,
        dateOfBirth = Date(dateOfBirth),
    )
}

