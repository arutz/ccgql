package org.slashdev.demo.ccgql.model

import java.util.*

data class Person(
    val id: Int? = null,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val occupation: Occupation,
    val dateOfBirth: Date,
)

