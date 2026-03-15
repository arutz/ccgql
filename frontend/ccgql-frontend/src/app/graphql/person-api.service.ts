import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  DeletePersonGQL,
  FindPersonDetailGQL,
  FindPersonGQL,
  FindPersonDetailQuery,
  ListPersonsGQL,
  ListPersonsSummaryGQL,
  Person,
  PersonFieldsFragment,
  PersonInput,
  PersonSummaryFragment,
  SavePersonGQL,
  CityFieldsFragment,
} from "../../generated/graphql";

export type PersonDetailResult = {
  person: (PersonFieldsFragment & Pick<Person, "addresses">) | null;
  cities: CityFieldsFragment[];
};

@Injectable({
  providedIn: "root",
})
export class PersonApiService {
  private readonly listPersonsGql = inject(ListPersonsGQL);
  private readonly listPersonsSummaryGql = inject(ListPersonsSummaryGQL);
  private readonly findPersonDetailGql = inject(FindPersonDetailGQL);
  private readonly findPersonGql = inject(FindPersonGQL);
  private readonly savePersonGql = inject(SavePersonGQL);
  private readonly deletePersonGql = inject(DeletePersonGQL);

  listPersons(): Observable<PersonFieldsFragment[]> {
    return this.listPersonsGql
      .fetch({ fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.listPersons ?? []) as PersonFieldsFragment[]));
  }

  listPersonsSummary(): Observable<PersonSummaryFragment[]> {
    return this.listPersonsSummaryGql
      .fetch({ fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.listPersons ?? []) as PersonSummaryFragment[]));
  }

  watchPersons(): Observable<PersonFieldsFragment[]> {
    return this.listPersonsGql
      .watch({ fetchPolicy: "cache-and-network" })
      .valueChanges.pipe(map(({ data }) => (data?.listPersons ?? []) as PersonFieldsFragment[]));
  }

  findPerson(id: number): Observable<PersonFieldsFragment | null> {
    return this.findPersonGql
      .fetch({ variables: { id }, fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.findPerson ?? null) as PersonFieldsFragment | null));
  }

  findPersonDetail(id: number): Observable<PersonDetailResult> {
    return this.findPersonDetailGql.fetch({ variables: { id }, fetchPolicy: "network-only" }).pipe(
      map(({ data }) => toPersonDetailResult(data)),
    );
  }

  savePerson(person: PersonInput): Observable<PersonFieldsFragment> {
    return this.savePersonGql.mutate({ variables: { person } }).pipe(
      map((result) => {
        const savedPerson = result.data?.savePerson;

        if (!savedPerson) {
          throw new Error("savePerson returned no data");
        }

        return savedPerson;
      }),
    );
  }

  deletePerson(id: number): Observable<boolean> {
    return this.deletePersonGql.mutate({ variables: { id } }).pipe(
      map((result) => {
        const wasDeleted = result.data?.deletePerson;

        if (typeof wasDeleted !== "boolean") {
          throw new Error("deletePerson returned no data");
        }

        return wasDeleted;
      }),
    );
  }
}

function toPersonDetailResult(data: FindPersonDetailQuery | null | undefined): PersonDetailResult {
  return {
    person: (data?.findPerson ?? null) as PersonDetailResult["person"],
    cities: (data?.listCities ?? []) as CityFieldsFragment[],
  };
}

