package org.slashdev.demo.ccgql.repository

import org.slashdev.demo.ccgql.model.common.Address

interface AddressRepository : CrudRepository<Address> {
	fun findByPersonId(personId: Int): List<Address>
}

