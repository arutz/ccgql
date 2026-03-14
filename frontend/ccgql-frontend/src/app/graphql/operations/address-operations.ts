import { gql } from "apollo-angular";

export const ADDRESS_FIELDS_FRAGMENT = gql`
  fragment AddressFields on Address {
    id
    personId
    street
    cityId
    state
    zipCode
  }
`;

export const LIST_ADDRESSES_QUERY = gql`
  query ListAddresses {
    listAddresses {
      ...AddressFields
    }
  }

  ${ADDRESS_FIELDS_FRAGMENT}
`;

export const FIND_ADDRESS_QUERY = gql`
  query FindAddress($id: Int!) {
    findAddress(id: $id) {
      ...AddressFields
    }
  }

  ${ADDRESS_FIELDS_FRAGMENT}
`;

export const SAVE_ADDRESS_MUTATION = gql`
  mutation SaveAddress($person: AddressInput!) {
    saveAddress(person: $person) {
      ...AddressFields
    }
  }

  ${ADDRESS_FIELDS_FRAGMENT}
`;

export const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($id: Int!) {
    deleteAddress(id: $id)
  }
`;
