package org.slashdev.demo.ccgql.model

data class Address(
    val id: Int? = null,
    val personId: Int,
    val street: String,
    val cityId: Int,
    val state: String,
    val zipCode: String,
)

