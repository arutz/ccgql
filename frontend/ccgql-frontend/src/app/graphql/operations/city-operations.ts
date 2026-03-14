import { gql } from "apollo-angular";

export const CITY_FIELDS_FRAGMENT = gql`
  fragment CityFields on City {
    id
    name
    country
  }
`;

export const LIST_CITIES_QUERY = gql`
  query ListCities {
    listCities {
      ...CityFields
    }
  }

  ${CITY_FIELDS_FRAGMENT}
`;

export const FIND_CITY_QUERY = gql`
  query FindCity($id: Int!) {
    findCity(id: $id) {
      ...CityFields
    }
  }

  ${CITY_FIELDS_FRAGMENT}
`;

export const SAVE_CITY_MUTATION = gql`
  mutation SaveCity($person: CityInput!) {
    saveCity(person: $person) {
      ...CityFields
    }
  }

  ${CITY_FIELDS_FRAGMENT}
`;

export const DELETE_CITY_MUTATION = gql`
  mutation DeleteCity($id: Int!) {
    deleteCity(id: $id)
  }
`;
