package org.slashdev.demo.ccgql.repository.exposed

import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slashdev.demo.ccgql.model.Address
import org.slashdev.demo.ccgql.model.City
import org.slashdev.demo.ccgql.model.Occupation
import org.slashdev.demo.ccgql.model.Person
import org.slashdev.demo.ccgql.schema.tables.AddressTable
import org.slashdev.demo.ccgql.schema.tables.CityTable
import org.slashdev.demo.ccgql.schema.tables.PersonTable
import java.util.UUID

class ExposedRepositoriesTest {
    private lateinit var database: Database
    private lateinit var cityRepository: ExposedCityRepository
    private lateinit var personRepository: ExposedPersonRepository
    private lateinit var addressRepository: ExposedAddressRepository

    @BeforeTest
    fun setUp() {
        database = Database.connect(
            url = "jdbc:h2:mem:${UUID.randomUUID()};DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver",
        )

        transaction(database) {
            SchemaUtils.create(CityTable, PersonTable, AddressTable)
        }

        cityRepository = ExposedCityRepository(database)
        personRepository = ExposedPersonRepository(database)
        addressRepository = ExposedAddressRepository(database)
    }

    @Test
    fun cityRepositorySupportsCrudAndSave() {
        val created = cityRepository.create(
            City(
                name = "Berlin",
                country = "Germany",
            )
        )

        val createdId = assertNotNull(created.id)
        assertEquals(created, cityRepository.findById(createdId))

        val updated = cityRepository.update(
            createdId,
            created.copy(name = "Hamburg"),
        )

        assertEquals("Hamburg", updated?.name)

        val savedNew = cityRepository.save(
            City(
                name = "Munich",
                country = "Germany",
            )
        )
        val savedUpdated = cityRepository.save(savedNew.copy(country = "DE"))

        assertEquals(savedNew.id, savedUpdated.id)
        assertEquals("DE", savedUpdated.country)
        assertEquals(2, cityRepository.findAll().size)
        assertTrue(cityRepository.delete(createdId))
        assertNull(cityRepository.findById(createdId))
        assertFalse(cityRepository.delete(9999))
    }

    @Test
    fun personRepositorySupportsCrudAndSave() {
        val created = personRepository.create(
            Person(
                firstName = "Ada",
                lastName = "Lovelace",
                email = "ada@example.com",
                phone = "+49-111",
                occupation = Occupation.ENGINEER,
                dateOfBirth = 1_234_567_890L,
            )
        )

        val createdId = assertNotNull(created.id)
        assertEquals(created, personRepository.findById(createdId))

        val updated = personRepository.update(
            createdId,
            created.copy(email = "ada.lovelace@example.com"),
        )

        assertEquals("ada.lovelace@example.com", updated?.email)

        val savedNew = personRepository.save(
            Person(
                firstName = "Grace",
                lastName = "Hopper",
                email = "grace@example.com",
                phone = "+49-222",
                occupation = Occupation.TEACHER,
                dateOfBirth = 9_876_543_210L,
            )
        )
        val savedUpdated = personRepository.save(savedNew.copy(phone = "+49-333"))

        assertEquals(savedNew.id, savedUpdated.id)
        assertEquals("+49-333", savedUpdated.phone)
        assertEquals(2, personRepository.findAll().size)
        assertTrue(personRepository.delete(createdId))
        assertNull(personRepository.findById(createdId))
        assertFalse(personRepository.delete(9999))
    }

    @Test
    fun addressRepositorySupportsCrudAndSave() {
        val city = cityRepository.create(City(name = "Cologne", country = "Germany"))
        val person = personRepository.create(
            Person(
                firstName = "Linus",
                lastName = "Torvalds",
                email = "linus@example.com",
                phone = "+49-444",
                occupation = Occupation.OTHER,
                dateOfBirth = 123_123_123L,
            )
        )

        val created = addressRepository.create(
            Address(
                personId = assertNotNull(person.id),
                street = "Main Street 1",
                cityId = assertNotNull(city.id),
                state = "NRW",
                zipCode = "50667",
            )
        )

        val createdId = assertNotNull(created.id)
        assertEquals(created, addressRepository.findById(createdId))

        val updated = addressRepository.update(
            createdId,
            created.copy(zipCode = "50668"),
        )

        assertEquals("50668", updated?.zipCode)

        val savedNew = addressRepository.save(
            Address(
                personId = assertNotNull(person.id),
                street = "Second Street 2",
                cityId = assertNotNull(city.id),
                state = "NRW",
                zipCode = "50669",
            )
        )
        val savedUpdated = addressRepository.save(savedNew.copy(street = "Updated Street 3"))

        assertEquals(savedNew.id, savedUpdated.id)
        assertEquals("Updated Street 3", savedUpdated.street)
        assertEquals(2, addressRepository.findAll().size)
        assertTrue(addressRepository.delete(createdId))
        assertNull(addressRepository.findById(createdId))
        assertFalse(addressRepository.delete(9999))
    }
}

