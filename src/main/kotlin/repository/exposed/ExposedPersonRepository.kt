package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.schema.entities.PersonEntity

class ExposedPersonRepository(
    database: Database,
) : AbstractExposedDaoRepository<Person, PersonEntity>(database), PersonRepository {
    override val entityClass: IntEntityClass<PersonEntity> = PersonEntity

    override fun toModel(entity: PersonEntity): Person = entity.toModel()

    override fun createEntity(model: Person): PersonEntity {
        return PersonEntity.new {
            firstName = model.firstName
            lastName = model.lastName
            email = model.email
            phone = model.phone
            occupation = model.occupation
            dateOfBirth = model.dateOfBirth
        }
    }

    override fun updateEntity(entity: PersonEntity, model: Person): PersonEntity {
        return entity.apply {
            firstName = model.firstName
            lastName = model.lastName
            email = model.email
            phone = model.phone
            occupation = model.occupation
            dateOfBirth = model.dateOfBirth
        }
    }

    override fun getModelId(model: Person): Int? = model.id

    override fun clearModelId(model: Person): Person = model.copy(id = null)
}

