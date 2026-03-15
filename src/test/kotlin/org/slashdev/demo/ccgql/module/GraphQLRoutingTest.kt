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
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.PersonBase
import org.slashdev.demo.ccgql.repository.AddressRepository
import org.slashdev.demo.ccgql.repository.CityRepository
import org.slashdev.demo.ccgql.repository.PersonRepository
import org.slashdev.demo.ccgql.schema.gql.domain.PersonSchemaSupport
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GraphQLRoutingTest {

    private val objectMapper = ObjectMapper()

    private val existingPersonBase = PersonBase(
        id = 1,
        firstName = "Ada",
        lastName = "Lovelace",
        email = "ada@example.com",
        phone = "+49-111",
        occupation = Occupation.ENGINEER,
        dateOfBirth = Date.from(Instant.parse("1815-12-10T00:00:00Z")),
    )

    private val existingAddress = Address(
        id = 1,
        personId = 1,
        street = "Analytical Engine Street 1",
        cityId = 1,
        state = "London",
        zipCode = "A1 1AA",
    )

    private fun createPersonRepositoryMock(initialPersons: List<PersonBase> = listOf(existingPersonBase)): PersonRepository {
        val persons = initialPersons.toMutableList()
        return mockk {
            every { findAll() } answers { persons.toList() }
            every { findById(any()) } answers { persons.firstOrNull { it.id == firstArg() } }
            every { save(any()) } answers {
                val personBase = firstArg<PersonBase>()
                val saved = personBase.copy(id = personBase.id ?: ((persons.maxOfOrNull { it.id ?: 0 } ?: 0) + 1))
                persons.removeIf { it.id == saved.id }
                persons += saved
                saved
            }
        }
    }

    private fun Application.configureTestGraphQlApp(
        personRepository: PersonRepository = createPersonRepositoryMock(),
        cityRepository: CityRepository = mockk(relaxed = true),
        addressRepository: AddressRepository = mockk {
            every { findByPersonId(existingPersonBase.id!!) } returns listOf(existingAddress)
            every { findByPersonId(match { it != existingPersonBase.id }) } returns emptyList()
        },
    ) {
        val personSchemaSupport = PersonSchemaSupport(addressRepository)

        dependencies {
            provide<PersonRepository> { personRepository }
            provide<CityRepository> { cityRepository }
            provide<AddressRepository> { addressRepository }
            provide<PersonSchemaSupport> { personSchemaSupport }
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
        val savedPersonBase = slot<PersonBase>()

        every { repository.save(capture(savedPersonBase)) } answers {
            val person = savedPersonBase.captured
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
        assertEquals(Date.from(Instant.parse("1906-12-09T00:00:00Z")), savedPersonBase.captured.dateOfBirth)
        verify(exactly = 1) { repository.save(any()) }
    }

    @Test
    fun graphqlPostRouteResolvesAddressesForPersonSchema() = testGraphQlApplication {
        val addressRepository = mockk<AddressRepository> {
            every { findByPersonId(existingPersonBase.id!!) } returns listOf(existingAddress)
            every { findByPersonId(match { it != existingPersonBase.id }) } returns emptyList()
        }

        application {
            configureTestGraphQlApp(addressRepository = addressRepository)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody(
                """{"query":"query { listPersons { id addresses { id street zipCode } } }"}"""
            )
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val payload = objectMapper.readTree(response.bodyAsText())
        assertEquals("Analytical Engine Street 1", payload.at("/data/listPersons/0/addresses/0/street").asText())
        assertEquals("A1 1AA", payload.at("/data/listPersons/0/addresses/0/zipCode").asText())
        verify(exactly = 1) { addressRepository.findByPersonId(existingPersonBase.id!!) }
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
