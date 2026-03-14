package org.slashdev.demo.ccgql.module

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.di.*
import io.ktor.server.testing.*
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.repository.PersonRepository
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GraphQLRoutingTest {

    private val existingPerson = Person(
        id = 1,
        firstName = "Ada",
        lastName = "Lovelace",
        email = "ada@example.com",
        phone = "+49-111",
        occupation = Occupation.ENGINEER,
        dateOfBirth = Date.from(Instant.parse("1815-12-10T00:00:00Z")),
    )

    private fun Application.configureTestGraphQlApp(repository: PersonRepository = FakePersonRepository(existingPerson)) {
        dependencies {
            provide<PersonRepository> { repository }
        }

        configureSerialization()
        configureGraphQl()
        configureRooting()
    }

    @Test
    fun graphiqlRouteReturnsHtml() = testApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.get("/graphiql")

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("GraphiQL", ignoreCase = true))
    }

    @Test
    fun graphqlPostRouteSerializesDateScalar() = testApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""{"query":"query { list { id firstName dateOfBirth } }"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("\"dateOfBirth\" : \"1815-12-10T00:00:00Z\""))
    }

    @Test
    fun graphqlPostRouteParsesDateScalarInput() = testApplication {
        val repository = FakePersonRepository(existingPerson)

        application {
            configureTestGraphQlApp(repository)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody(
                """
                {
                  "query":"query { save(person: { firstName: \"Grace\", lastName: \"Hopper\", email: \"grace@example.com\", phone: \"+49-222\", occupation: TEACHER, dateOfBirth: \"1906-12-09T00:00:00Z\" }) { firstName dateOfBirth } }"
                }
                """.trimIndent()
            )
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("\"dateOfBirth\" : \"1906-12-09T00:00:00Z\""))
        assertEquals(Date.from(Instant.parse("1906-12-09T00:00:00Z")), repository.lastSavedPerson?.dateOfBirth)
    }
}

private class FakePersonRepository(initialPerson: Person? = null) : PersonRepository {
    private val persons = initialPerson?.let { mutableListOf(it) } ?: mutableListOf()
    var lastSavedPerson: Person? = null
        private set

    override fun findAll(): List<Person> = persons.toList()

    override fun findById(id: Int): Person? = persons.firstOrNull { it.id == id }

    override fun create(entity: Person): Person = save(entity)

    override fun update(id: Int, entity: Person): Person? {
        val index = persons.indexOfFirst { it.id == id }
        return if (index >= 0) {
            val updated = entity.copy(id = id)
            persons[index] = updated
            updated
        } else {
            null
        }
    }

    override fun delete(id: Int): Boolean = persons.removeIf { it.id == id }

    override fun save(entity: Person): Person {
        val saved = entity.copy(id = entity.id ?: ((persons.maxOfOrNull { it.id ?: 0 } ?: 0) + 1))
        persons.removeIf { it.id == saved.id }
        persons += saved
        lastSavedPerson = saved
        return saved
    }
}
