package org.slashdev.demo.ccgql.controller

import com.expediagroup.graphql.server.operations.Mutation
import com.expediagroup.graphql.server.operations.Query
import org.slashdev.demo.ccgql.model.PersonBase
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.schema.gql.schema.PersonSchema
import org.slashdev.demo.ccgql.schema.gql.schema.PersonSchemaSupport
import org.slashdev.demo.ccgql.schema.gql.schema.toSchema

@Suppress("unused") // endpoint for gql
class PersonQuery(
    private val personRepository: PersonRepository,
    private val personSchemaSupport: PersonSchemaSupport,
) : Query {
    fun findPerson(id: Int): PersonSchema? =
        personRepository.findById(id)?.toSchema(personSchemaSupport)

    fun listPersons(): List<PersonSchema> = personRepository.findAll().map { it.toSchema(personSchemaSupport) }
}

@Suppress("unused") // endpoint for gql
class PersonMutation(
    private val personRepository: PersonRepository,
    private val personSchemaSupport: PersonSchemaSupport,
) : Mutation {
    fun savePerson(personBase: PersonBase): PersonSchema =
        personRepository.save(personBase).toSchema(personSchemaSupport)

    fun deletePerson(id: Int) = personRepository.delete(id)
}