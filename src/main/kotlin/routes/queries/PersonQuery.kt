package org.slashdev.demo.ccgql.routes.queries

import com.expediagroup.graphql.server.operations.Query

class PersonQuery : Query {
    
    fun sayHello(name: String) = "Hello $name"

}