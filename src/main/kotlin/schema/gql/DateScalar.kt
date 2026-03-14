package org.slashdev.demo.ccgql.schema.gql

import graphql.GraphQLContext
import graphql.execution.CoercedVariables
import graphql.language.IntValue
import graphql.language.StringValue
import graphql.language.Value
import graphql.schema.*
import java.time.Instant
import java.time.format.DateTimeParseException
import java.util.*

private const val DATE_SCALAR_NAME = "Date"

private fun parseDate(value: Any?): Date = when (value) {
    is Date -> value
    is String -> try {
        Date.from(Instant.parse(value))
    } catch (exception: DateTimeParseException) {
        throw CoercingParseValueException(
            "Invalid $DATE_SCALAR_NAME value '$value'. Expected ISO-8601 instant.",
            exception
        )
    }

    is Number -> Date(value.toLong())
    else -> throw CoercingParseValueException("Invalid $DATE_SCALAR_NAME value '$value'.")
}

val graphQLDateScalar: GraphQLScalarType = GraphQLScalarType.newScalar()
    .name(DATE_SCALAR_NAME)
    .description("java.util.Date serialized as an ISO-8601 instant in UTC")
    .coercing(object : Coercing<Date, String> {
        override fun serialize(dataFetcherResult: Any, graphQLContext: GraphQLContext, locale: Locale): String {
            val date = when (dataFetcherResult) {
                is Date,
                is String,
                is Number -> parseDate(dataFetcherResult)

                else -> throw CoercingSerializeException("Expected Date, String, or Number but was '${dataFetcherResult::class.qualifiedName}'.")
            }

            return Instant.ofEpochMilli(date.time).toString()
        }

        override fun parseValue(input: Any, graphQLContext: GraphQLContext, locale: Locale): Date =
            parseDate(input)

        override fun parseLiteral(
            input: Value<*>,
            variables: CoercedVariables,
            graphQLContext: GraphQLContext,
            locale: Locale,
        ): Date = when (input) {
            is StringValue -> parseDate(input.value)
            is IntValue -> parseDate(input.value.toLong())
            else -> throw CoercingParseLiteralException("Expected StringValue or IntValue for $DATE_SCALAR_NAME.")
        }

        override fun valueToLiteral(input: Any, graphQLContext: GraphQLContext, locale: Locale): Value<*> =
            StringValue(serialize(input, graphQLContext, locale))
    })
    .build()
