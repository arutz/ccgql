package org.slashdev.demo.ccgql.repository

interface CrudRepository<T> {
    fun findAll(): List<T>

    fun findById(id: Int): T?

    fun create(entity: T): T

    fun update(id: Int, entity: T): T?

    fun delete(id: Int): Boolean

    fun save(entity: T): T
}

