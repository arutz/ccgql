import { gql } from "apollo-angular";
import { ADDRESS_FIELDS_FRAGMENT } from "./address-operations";
import { CITY_FIELDS_FRAGMENT } from "./city-operations";

export const PERSON_SUMMARY_FRAGMENT = gql`
  fragment PersonSummary on Person {
    id
    firstName
    lastName
    dateOfBirth
  }
`;

export const LIST_PERSONS_SUMMARY_QUERY = gql`
  query ListPersonsSummary {
    listPersons {
      ...PersonSummary
    }
  }

  ${PERSON_SUMMARY_FRAGMENT}
`;

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

export const FIND_PERSON_DETAIL_QUERY = gql`
  query FindPersonDetail($id: Int!) {
    findPerson(id: $id) {
      ...PersonFields
      addresses {
        ...AddressFields
      }
    }
    listCities {
      ...CityFields
    }
  }

  ${PERSON_FIELDS_FRAGMENT}
  ${ADDRESS_FIELDS_FRAGMENT}
  ${CITY_FIELDS_FRAGMENT}
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
