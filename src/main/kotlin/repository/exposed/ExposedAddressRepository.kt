package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.model.common.Address
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.model.entities.AddressEntity
import org.slashdev.demo.ccgql.model.entities.CityEntity
import org.slashdev.demo.ccgql.model.entities.PersonEntity
import org.slashdev.demo.ccgql.model.tables.AddressTable

class ExposedAddressRepository(
    database: Database,
) : AbstractExposedDaoRepository<Address, AddressEntity>(database), AddressRepository {
    override val entityClass: IntEntityClass<AddressEntity> = AddressEntity

    override fun findByPersonId(personId: Int): List<Address> = dbQuery {
        entityClass.find { AddressTable.personId eq personId }.map(::toModel)
    }

    override fun toModel(entity: AddressEntity): Address = entity.toModel()

    override fun createEntity(model: Address): AddressEntity {
        return AddressEntity.new {
            person = PersonEntity[model.personId]
            street = model.street
            city = CityEntity[model.cityId]
            state = model.state
            zipCode = model.zipCode
        }
    }

    override fun updateEntity(entity: AddressEntity, model: Address): AddressEntity {
        return entity.apply {
            person = PersonEntity[model.personId]
            street = model.street
            city = CityEntity[model.cityId]
            state = model.state
            zipCode = model.zipCode
        }
    }

    override fun getModelId(model: Address): Int? = model.id

    override fun clearModelId(model: Address): Address = model.copy(id = null)
}

