import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  CityFieldsFragment,
  CityInput,
  DeleteCityGQL,
  FindCityGQL,
  ListCitiesGQL,
  SaveCityGQL,
} from "../../generated/graphql";

@Injectable({
  providedIn: "root",
})
export class CityApiService {
  private readonly listCitiesGql = inject(ListCitiesGQL);
  private readonly findCityGql = inject(FindCityGQL);
  private readonly saveCityGql = inject(SaveCityGQL);
  private readonly deleteCityGql = inject(DeleteCityGQL);

  listCities(): Observable<CityFieldsFragment[]> {
    return this.listCitiesGql
      .fetch({ fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.listCities ?? []) as CityFieldsFragment[]));
  }

  watchCities(): Observable<CityFieldsFragment[]> {
    return this.listCitiesGql
      .watch({ fetchPolicy: "cache-and-network" })
      .valueChanges.pipe(map(({ data }) => (data?.listCities ?? []) as CityFieldsFragment[]));
  }

  findCity(id: number): Observable<CityFieldsFragment | null> {
    return this.findCityGql
      .fetch({ variables: { id }, fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.findCity ?? null) as CityFieldsFragment | null));
  }

  saveCity(city: CityInput): Observable<CityFieldsFragment> {
    return this.saveCityGql.mutate({ variables: { person: city } }).pipe(
      map((result) => {
        const savedCity = result.data?.saveCity;

        if (!savedCity) {
          throw new Error("saveCity returned no data");
        }

        return savedCity;
      }),
    );
  }

  deleteCity(id: number): Observable<boolean> {
    return this.deleteCityGql.mutate({ variables: { id } }).pipe(
      map((result) => {
        const wasDeleted = result.data?.deleteCity;

        if (typeof wasDeleted !== "boolean") {
          throw new Error("deleteCity returned no data");
        }

        return wasDeleted;
      }),
    );
  }
}
