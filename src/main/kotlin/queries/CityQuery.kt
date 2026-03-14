package org.slashdev.demo.ccgql.queries

import com.expediagroup.graphql.server.operations.Mutation
import com.expediagroup.graphql.server.operations.Query
import org.slashdev.demo.ccgql.model.City
import org.slashdev.demo.ccgql.repository.CityRepository

class CityQuery(val cityRepository: CityRepository) : Query {
    fun findCity(id: Int): City? =
        cityRepository.findById(id)

    fun listCities(): List<City> = cityRepository.findAll()
}

class CityMutation(val cityRepository: CityRepository) : Mutation {
    fun saveCity(person: City) = cityRepository.save(person)

    fun deleteCity(id: Int) = cityRepository.delete(id)
}