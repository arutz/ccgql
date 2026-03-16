package org.slashdev.demo.ccgql.module

import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slashdev.demo.ccgql.model.tables.AddressTable
import org.slashdev.demo.ccgql.model.tables.CityTable
import org.slashdev.demo.ccgql.model.tables.PersonTable

fun Application.configureDatabase() {
    val database: Database by dependencies

    transaction(database) {
        SchemaUtils.createMissingTablesAndColumns(CityTable, PersonTable, AddressTable)
    }

}