package org.slashdev.demo.ccgql

import io.ktor.server.application.*
import org.slashdev.demo.ccgql.module.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configurePostgres()
    configureDatabase()
    configureRepositories()
    configureCors()
    configureGraphQl()
    configureRooting()
}
