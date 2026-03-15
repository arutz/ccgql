package org.slashdev.demo.ccgql.module

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*

fun Application.configureCors() {
    install(CORS) {
        allowHost("localhost:4200", schemes = listOf("http"))
        allowHost("127.0.0.1:4200", schemes = listOf("http"))
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.Accept)
        allowHeadersPrefixed("apollo-")
        allowNonSimpleContentTypes = true
        allowSameOrigin = true
    }
}

