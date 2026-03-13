package org.slashdev.demo.ccgql.module


import com.expediagroup.graphql.server.ktor.graphQLPostRoute
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.configureRooting() {
    routing {
        graphQLPostRoute()
        route("/api") {
        }
    }
}