package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.schema.entities.AddressEntity
import org.slashdev.demo.ccgql.schema.entities.CityEntity
import org.slashdev.demo.ccgql.schema.entities.PersonEntity

class ExposedAddressRepository(
    database: Database,
) : AbstractExposedDaoRepository<Address, AddressEntity>(database), AddressRepository {
    override val entityClass: IntEntityClass<AddressEntity> = AddressEntity

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

