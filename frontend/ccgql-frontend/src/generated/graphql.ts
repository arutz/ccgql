import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** java.util.Date serialized as an ISO-8601 instant in UTC */
  Date: { input: string; output: string; }
};

export type Address = {
  __typename?: 'Address';
  cityId: Scalars['Int']['output'];
  id?: Maybe<Scalars['Int']['output']>;
  personId: Scalars['Int']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
  zipCode: Scalars['String']['output'];
};

export type AddressInput = {
  cityId: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  personId: Scalars['Int']['input'];
  state: Scalars['String']['input'];
  street: Scalars['String']['input'];
  zipCode: Scalars['String']['input'];
};

export type City = {
  __typename?: 'City';
  country: Scalars['String']['output'];
  id?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
};

export type CityInput = {
  country: Scalars['String']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteAddress: Scalars['Boolean']['output'];
  deleteCity: Scalars['Boolean']['output'];
  deletePerson: Scalars['Boolean']['output'];
  saveAddress: Address;
  saveCity: City;
  savePerson: Person;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCityArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSaveAddressArgs = {
  person: AddressInput;
};


export type MutationSaveCityArgs = {
  person: CityInput;
};


export type MutationSavePersonArgs = {
  person: PersonInput;
};

export enum Occupation {
  Artist = 'ARTIST',
  Doctor = 'DOCTOR',
  Engineer = 'ENGINEER',
  Other = 'OTHER',
  Teacher = 'TEACHER'
}

export type Person = {
  __typename?: 'Person';
  addresses: Array<Address>;
  dateOfBirth: Scalars['Date']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id?: Maybe<Scalars['Int']['output']>;
  lastName: Scalars['String']['output'];
  occupation: Occupation;
  phone: Scalars['String']['output'];
};

export type PersonInput = {
  dateOfBirth: Scalars['Date']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  lastName: Scalars['String']['input'];
  occupation: Occupation;
  phone: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  findAddress?: Maybe<Address>;
  findCity?: Maybe<City>;
  findPerson?: Maybe<Person>;
  listAddresses: Array<Address>;
  listCities: Array<City>;
  listPersons: Array<Person>;
};


export type QueryFindAddressArgs = {
  id: Scalars['Int']['input'];
};


export type QueryFindCityArgs = {
  id: Scalars['Int']['input'];
};


export type QueryFindPersonArgs = {
  id: Scalars['Int']['input'];
};

export type AddressFieldsFragment = { __typename?: 'Address', id?: number | null, personId: number, street: string, cityId: number, state: string, zipCode: string };

export type ListAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAddressesQuery = { __typename?: 'Query', listAddresses: Array<{ __typename?: 'Address', id?: number | null, personId: number, street: string, cityId: number, state: string, zipCode: string }> };

export type FindAddressQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type FindAddressQuery = { __typename?: 'Query', findAddress?: { __typename?: 'Address', id?: number | null, personId: number, street: string, cityId: number, state: string, zipCode: string } | null };

export type SaveAddressMutationVariables = Exact<{
  person: AddressInput;
}>;


export type SaveAddressMutation = { __typename?: 'Mutation', saveAddress: { __typename?: 'Address', id?: number | null, personId: number, street: string, cityId: number, state: string, zipCode: string } };

export type DeleteAddressMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteAddressMutation = { __typename?: 'Mutation', deleteAddress: boolean };

export type CityFieldsFragment = { __typename?: 'City', id?: number | null, name: string, country: string };

export type ListCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListCitiesQuery = { __typename?: 'Query', listCities: Array<{ __typename?: 'City', id?: number | null, name: string, country: string }> };

export type FindCityQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type FindCityQuery = { __typename?: 'Query', findCity?: { __typename?: 'City', id?: number | null, name: string, country: string } | null };

export type SaveCityMutationVariables = Exact<{
  person: CityInput;
}>;


export type SaveCityMutation = { __typename?: 'Mutation', saveCity: { __typename?: 'City', id?: number | null, name: string, country: string } };

export type DeleteCityMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCityMutation = { __typename?: 'Mutation', deleteCity: boolean };

export type PersonSummaryFragment = { __typename?: 'Person', id?: number | null, firstName: string, lastName: string, dateOfBirth: string };

export type ListPersonsSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPersonsSummaryQuery = { __typename?: 'Query', listPersons: Array<{ __typename?: 'Person', id?: number | null, firstName: string, lastName: string, dateOfBirth: string }> };

export type PersonFieldsFragment = { __typename?: 'Person', id?: number | null, firstName: string, lastName: string, email: string, phone: string, occupation: Occupation, dateOfBirth: string };

export type ListPersonsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPersonsQuery = { __typename?: 'Query', listPersons: Array<{ __typename?: 'Person', id?: number | null, firstName: string, lastName: string, email: string, phone: string, occupation: Occupation, dateOfBirth: string }> };

export type FindPersonQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type FindPersonQuery = { __typename?: 'Query', findPerson?: { __typename?: 'Person', id?: number | null, firstName: string, lastName: string, email: string, phone: string, occupation: Occupation, dateOfBirth: string } | null };

export type SavePersonMutationVariables = Exact<{
  person: PersonInput;
}>;


export type SavePersonMutation = { __typename?: 'Mutation', savePerson: { __typename?: 'Person', id?: number | null, firstName: string, lastName: string, email: string, phone: string, occupation: Occupation, dateOfBirth: string } };

export type DeletePersonMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeletePersonMutation = { __typename?: 'Mutation', deletePerson: boolean };

export const AddressFieldsFragmentDoc = gql`
    fragment AddressFields on Address {
  id
  personId
  street
  cityId
  state
  zipCode
}
    `;
export const CityFieldsFragmentDoc = gql`
    fragment CityFields on City {
  id
  name
  country
}
    `;
export const PersonSummaryFragmentDoc = gql`
    fragment PersonSummary on Person {
  id
  firstName
  lastName
  dateOfBirth
}
    `;
export const PersonFieldsFragmentDoc = gql`
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
export const ListAddressesDocument = gql`
    query ListAddresses {
  listAddresses {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ListAddressesGQL extends Apollo.Query<ListAddressesQuery, ListAddressesQueryVariables> {
    document = ListAddressesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const FindAddressDocument = gql`
    query FindAddress($id: Int!) {
  findAddress(id: $id) {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class FindAddressGQL extends Apollo.Query<FindAddressQuery, FindAddressQueryVariables> {
    document = FindAddressDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SaveAddressDocument = gql`
    mutation SaveAddress($person: AddressInput!) {
  saveAddress(person: $person) {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SaveAddressGQL extends Apollo.Mutation<SaveAddressMutation, SaveAddressMutationVariables> {
    document = SaveAddressDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteAddressDocument = gql`
    mutation DeleteAddress($id: Int!) {
  deleteAddress(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteAddressGQL extends Apollo.Mutation<DeleteAddressMutation, DeleteAddressMutationVariables> {
    document = DeleteAddressDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ListCitiesDocument = gql`
    query ListCities {
  listCities {
    ...CityFields
  }
}
    ${CityFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ListCitiesGQL extends Apollo.Query<ListCitiesQuery, ListCitiesQueryVariables> {
    document = ListCitiesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const FindCityDocument = gql`
    query FindCity($id: Int!) {
  findCity(id: $id) {
    ...CityFields
  }
}
    ${CityFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class FindCityGQL extends Apollo.Query<FindCityQuery, FindCityQueryVariables> {
    document = FindCityDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SaveCityDocument = gql`
    mutation SaveCity($person: CityInput!) {
  saveCity(person: $person) {
    ...CityFields
  }
}
    ${CityFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SaveCityGQL extends Apollo.Mutation<SaveCityMutation, SaveCityMutationVariables> {
    document = SaveCityDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteCityDocument = gql`
    mutation DeleteCity($id: Int!) {
  deleteCity(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteCityGQL extends Apollo.Mutation<DeleteCityMutation, DeleteCityMutationVariables> {
    document = DeleteCityDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ListPersonsSummaryDocument = gql`
    query ListPersonsSummary {
  listPersons {
    ...PersonSummary
  }
}
    ${PersonSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ListPersonsSummaryGQL extends Apollo.Query<ListPersonsSummaryQuery, ListPersonsSummaryQueryVariables> {
    document = ListPersonsSummaryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ListPersonsDocument = gql`
    query ListPersons {
  listPersons {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ListPersonsGQL extends Apollo.Query<ListPersonsQuery, ListPersonsQueryVariables> {
    document = ListPersonsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const FindPersonDocument = gql`
    query FindPerson($id: Int!) {
  findPerson(id: $id) {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class FindPersonGQL extends Apollo.Query<FindPersonQuery, FindPersonQueryVariables> {
    document = FindPersonDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SavePersonDocument = gql`
    mutation SavePerson($person: PersonInput!) {
  savePerson(person: $person) {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SavePersonGQL extends Apollo.Mutation<SavePersonMutation, SavePersonMutationVariables> {
    document = SavePersonDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeletePersonDocument = gql`
    mutation DeletePerson($id: Int!) {
  deletePerson(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeletePersonGQL extends Apollo.Mutation<DeletePersonMutation, DeletePersonMutationVariables> {
    document = DeletePersonDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }