package org.slashdev.demo.ccgql.module

import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import org.jetbrains.exposed.sql.Database

fun Application.configurePostgres() {
    dependencies {
        provide<Database> {
            Database.connect(
                url = "jdbc:postgresql://localhost:5432/ccgql",
                driver = "org.postgresql.Driver",
                user = "postgres",
                password = "postgres"
            )
        }
    }
}