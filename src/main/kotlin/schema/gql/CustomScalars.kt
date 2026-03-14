package org.slashdev.demo.ccgql.schema.gql

import com.expediagroup.graphql.generator.hooks.SchemaGeneratorHooks
import java.util.*
import kotlin.reflect.KClass
import kotlin.reflect.KType


object CustomSchemaGeneratorHooks : SchemaGeneratorHooks {

    override fun willGenerateGraphQLType(type: KType) =
        when (type.classifier as? KClass<*>) {
            Date::class -> graphQLDateScalar
            UUID::class -> graphQLUUIDScalar
            else -> super.willGenerateGraphQLType(type)
        }
}

