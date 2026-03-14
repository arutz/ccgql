package org.slashdev.demo.ccgql.queries

import com.expediagroup.graphql.server.operations.Mutation
import com.expediagroup.graphql.server.operations.Query
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.repository.PersonRepository

@Suppress("unused") // endpoint for gql
class PersonQuery(val personRepository: PersonRepository) : Query {
    fun findPerson(id: Int): Person? =
        personRepository.findById(id)

    fun listPersons(): List<Person> = personRepository.findAll()
}

@Suppress("unused") // endpoint for gql
class PersonMutation(val personRepository: PersonRepository) : Mutation {
    fun savePerson(person: Person) = personRepository.save(person)

    fun deletePerson(id: Int) = personRepository.delete(id)
}