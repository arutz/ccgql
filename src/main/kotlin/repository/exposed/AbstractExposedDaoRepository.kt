package org.slashdev.demo.ccgql.repository.exposed

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import org.slashdev.demo.ccgql.repository.CrudRepository

abstract class AbstractExposedDaoRepository<TModel, TEntity : IntEntity>(
    private val database: Database,
) : CrudRepository<TModel> {
    protected abstract val entityClass: IntEntityClass<TEntity>

    protected abstract fun toModel(entity: TEntity): TModel

    protected abstract fun createEntity(model: TModel): TEntity

    protected abstract fun updateEntity(entity: TEntity, model: TModel): TEntity

    protected abstract fun getModelId(model: TModel): Int?

    protected abstract fun clearModelId(model: TModel): TModel

    protected fun <T> dbQuery(block: () -> T): T = transaction(database) {
        block()
    }

    override fun findAll(): List<TModel> = dbQuery {
        entityClass.all().map(::toModel)
    }

    override fun findById(id: Int): TModel? = dbQuery {
        entityClass.findById(id)?.let(::toModel)
    }

    override fun create(entity: TModel): TModel = dbQuery {
        toModel(createEntity(entity))
    }

    override fun update(id: Int, entity: TModel): TModel? = dbQuery {
        entityClass.findById(id)?.let { existingEntity ->
            toModel(updateEntity(existingEntity, entity))
        }
    }

    override fun delete(id: Int): Boolean = dbQuery {
        entityClass.findById(id)?.let {
            it.delete()
            true
        } ?: false
    }

    override fun save(entity: TModel): TModel {
        val entityId = getModelId(entity)
        return if (entityId == null) {
            create(entity)
        } else {
            update(entityId, entity) ?: create(clearModelId(entity))
        }
    }
}

