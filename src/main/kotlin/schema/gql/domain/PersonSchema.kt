package org.slashdev.demo.ccgql.schema.gql.domain

import com.expediagroup.graphql.generator.annotations.GraphQLName
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.Person
import java.util.*

@GraphQLName("Person")
class PersonSchema(
    val id: Int? = null,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val occupation: Occupation,
    val dateOfBirth: Date,
    private val support: PersonSchemaSupport,
) {
    fun addresses(): List<Address> = id?.let(support::addressesFor).orEmpty()
}

fun Person.toSchema(support: PersonSchemaSupport): PersonSchema = PersonSchema(
    id = id,
    firstName = firstName,
    lastName = lastName,
    email = email,
    phone = phone,
    occupation = occupation,
    dateOfBirth = dateOfBirth,
    support = support,
)
