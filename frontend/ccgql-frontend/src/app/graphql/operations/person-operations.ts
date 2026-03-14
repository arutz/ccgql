import { gql } from 'apollo-angular';

export const PERSON_FIELDS_FRAGMENT = gql`
  fragment PersonFields on Person {
	id
	firstName
	lastName
	email
	phone
	occupation
	dateOfBirth
  }
`;

export const LIST_PERSONS_QUERY = gql`
  query ListPersons {
	listPersons {
	  ...PersonFields
	}
  }

  ${PERSON_FIELDS_FRAGMENT}
`;

export const FIND_PERSON_QUERY = gql`
  query FindPerson($id: Int!) {
	findPerson(id: $id) {
	  ...PersonFields
	}
  }

  ${PERSON_FIELDS_FRAGMENT}
`;

export const SAVE_PERSON_MUTATION = gql`
  mutation SavePerson($person: PersonInput!) {
	savePerson(person: $person) {
	  ...PersonFields
	}
  }

  ${PERSON_FIELDS_FRAGMENT}
`;

export const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: Int!) {
	deletePerson(id: $id)
  }
`;

