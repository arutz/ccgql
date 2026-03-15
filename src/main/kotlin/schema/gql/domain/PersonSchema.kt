package org.slashdev.demo.ccgql.schema.gql.domain

import com.expediagroup.graphql.generator.annotations.GraphQLName
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.PersonBase
import java.util.*

@GraphQLName("Person")
@Suppress("unused") // graphql schema class; only used indirectly
/**
 * Class representing the GraphQL schema for a person. It is not a data class, because it also has support for
 * operations like to fetch related data (addresses) or other domain related operations.
 * **NOTE**: The class is supposed to extend the [PersonBase] interface but due to technical restrictions of gql
 * it cannot. Check the interface if you make changes to the field types or names to make sure they are in sync.
 * The same applies to the constructor parameters, which should be in sync with the fields of the {PersonBase}
 * interface.
 */
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

fun PersonBase.toSchema(support: PersonSchemaSupport): PersonSchema = PersonSchema(
    id = id,
    firstName = firstName,
    lastName = lastName,
    email = email,
    phone = phone,
    occupation = occupation,
    dateOfBirth = dateOfBirth,
    support = support,
)
