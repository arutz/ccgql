package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.model.PersonBase
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.schema.entities.PersonEntity

class ExposedPersonRepository(
    database: Database,
) : AbstractExposedDaoRepository<PersonBase, PersonEntity>(database), PersonRepository {
    override val entityClass: IntEntityClass<PersonEntity> = PersonEntity

    override fun toModel(entity: PersonEntity): PersonBase = entity.toModel()

    override fun createEntity(model: PersonBase): PersonEntity {
        return PersonEntity.new {
            firstName = model.firstName
            lastName = model.lastName
            email = model.email
            phone = model.phone
            occupation = model.occupation
            dateOfBirth = model.dateOfBirth.time
        }
    }

    override fun updateEntity(entity: PersonEntity, model: PersonBase): PersonEntity {
        return entity.apply {
            firstName = model.firstName
            lastName = model.lastName
            email = model.email
            phone = model.phone
            occupation = model.occupation
            dateOfBirth = model.dateOfBirth.time
        }
    }

    override fun getModelId(model: PersonBase): Int? = model.id

    override fun clearModelId(model: PersonBase): PersonBase = model.copy(id = null)
}

