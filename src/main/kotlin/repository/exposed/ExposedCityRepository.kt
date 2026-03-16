package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.slashdev.demo.ccgql.model.common.City
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.model.entities.CityEntity

class ExposedCityRepository(
    database: Database,
) : AbstractExposedDaoRepository<City, CityEntity>(database), CityRepository {
    override val entityClass: IntEntityClass<CityEntity> = CityEntity

    override fun toModel(entity: CityEntity): City = entity.toModel()

    override fun createEntity(model: City): CityEntity {
        return CityEntity.new {
            name = model.name
            country = model.country
        }
    }

    override fun updateEntity(entity: CityEntity, model: City): CityEntity {
        return entity.apply {
            name = model.name
            country = model.country
        }
    }

    override fun getModelId(model: City): Int? = model.id

    override fun clearModelId(model: City): City = model.copy(id = null)
}

