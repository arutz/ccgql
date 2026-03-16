package org.slashdev.demo.ccgql.model.common

import java.util.*

interface Person<IDType, DateType> {
    val id: IDType?
    val firstName: String
    val lastName: String
    val email: String
    val phone: String
    val occupation: Occupation
    val dateOfBirth: DateType
}

data class PersonBase(
    override val id: Int? = null,
    override val firstName: String,
    override val lastName: String,
    override val email: String,
    override val phone: String,
    override val occupation: Occupation,
    override val dateOfBirth: Date,
) : Person<Int, Date> {}

