package org.slashdev.demo.ccgql.module

import com.fasterxml.jackson.databind.ObjectMapper
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.plugins.di.*
import io.ktor.server.testing.*
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.repository.PersonRepository
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GraphQLRoutingTest {

    private val objectMapper = ObjectMapper()

    private val existingPerson = Person(
        id = 1,
        firstName = "Ada",
        lastName = "Lovelace",
        email = "ada@example.com",
        phone = "+49-111",
        occupation = Occupation.ENGINEER,
        dateOfBirth = Date.from(Instant.parse("1815-12-10T00:00:00Z")),
    )

    private fun createPersonRepositoryMock(initialPersons: List<Person> = listOf(existingPerson)): PersonRepository {
        val persons = initialPersons.toMutableList()
        return mockk {
            every { findAll() } answers { persons.toList() }
            every { findById(any()) } answers { persons.firstOrNull { it.id == firstArg() } }
            every { save(any()) } answers {
                val person = firstArg<Person>()
                val saved = person.copy(id = person.id ?: ((persons.maxOfOrNull { it.id ?: 0 } ?: 0) + 1))
                persons.removeIf { it.id == saved.id }
                persons += saved
                saved
            }
        }
    }

    private fun Application.configureTestGraphQlApp(
        personRepository: PersonRepository = createPersonRepositoryMock(),
        cityRepository: CityRepository = mockk(relaxed = true),
        addressRepository: AddressRepository = mockk(relaxed = true),
    ) {
        dependencies {
            provide<PersonRepository> { personRepository }
            provide<CityRepository> { cityRepository }
            provide<AddressRepository> { addressRepository }
        }

        configureCors()
        configureGraphQl()
        configureRooting()
    }

    private fun testGraphQlApplication(block: suspend ApplicationTestBuilder.() -> Unit) = testApplication {
        environment {
            config = MapApplicationConfig()
        }

        block()
    }

    @Test
    fun graphiqlRouteReturnsHtml() = testGraphQlApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.get("/graphiql")

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("GraphiQL", ignoreCase = true))
    }

    @Test
    fun graphqlPostRouteSerializesDateScalar() = testGraphQlApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""{"query":"query { listPersons { id firstName dateOfBirth } }"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(
            "1815-12-10T00:00:00Z",
            objectMapper.readTree(response.bodyAsText()).at("/data/listPersons/0/dateOfBirth").asText()
        )
    }

    @Test
    fun graphqlPostRouteParsesDateScalarInput() = testGraphQlApplication {
        val repository = createPersonRepositoryMock()
        val savedPerson = slot<Person>()

        every { repository.save(capture(savedPerson)) } answers {
            val person = savedPerson.captured
            person.copy(id = person.id ?: 2)
        }

        application {
            configureTestGraphQlApp(personRepository = repository)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody(
                """
                {
                  "query":"mutation { savePerson(person: { firstName: \"Grace\", lastName: \"Hopper\", email: \"grace@example.com\", phone: \"+49-222\", occupation: TEACHER, dateOfBirth: \"1906-12-09T00:00:00Z\" }) { firstName dateOfBirth } }"
                }
                """.trimIndent()
            )
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(
            "1906-12-09T00:00:00Z",
            objectMapper.readTree(response.bodyAsText()).at("/data/savePerson/dateOfBirth").asText()
        )
        assertEquals(Date.from(Instant.parse("1906-12-09T00:00:00Z")), savedPerson.captured.dateOfBirth)
        verify(exactly = 1) { repository.save(any()) }
    }

    @Test
    fun graphqlPreflightRequestReturnsCorsHeaders() = testGraphQlApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.options("/graphql") {
            header(HttpHeaders.Origin, "http://localhost:4200")
            header(HttpHeaders.AccessControlRequestMethod, HttpMethod.Post.value)
            header(HttpHeaders.AccessControlRequestHeaders, "content-type")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("http://localhost:4200", response.headers[HttpHeaders.AccessControlAllowOrigin])
        assertTrue(response.headers[HttpHeaders.AccessControlAllowHeaders]?.contains("Content-Type") == true)
    }

    @Test
    fun graphqlPostRouteIncludesCorsHeadersForAllowedOrigin() = testGraphQlApplication {
        application {
            configureTestGraphQlApp()
        }

        val response = client.post("/graphql") {
            header(HttpHeaders.Origin, "http://localhost:4200")
            contentType(ContentType.Application.Json)
            setBody("""{"query":"query { listPersons { id } }"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("http://localhost:4200", response.headers[HttpHeaders.AccessControlAllowOrigin])
    }
}
