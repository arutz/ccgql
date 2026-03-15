import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  CitySummaryFragment,
  ListHomeSummariesGQL,
  ListHomeSummariesQuery,
  PersonSummaryFragment,
} from "../../generated/graphql";

export type HomeSummariesResult = {
  persons: PersonSummaryFragment[];
  cities: CitySummaryFragment[];
};

@Injectable({
  providedIn: "root",
})
export class HomeApiService {
  private readonly listHomeSummariesGql = inject(ListHomeSummariesGQL);

  listHomeSummaries(): Observable<HomeSummariesResult> {
    return this.listHomeSummariesGql.fetch({ fetchPolicy: "network-only" }).pipe(
      map(({ data }) => toHomeSummariesResult(data)),
    );
  }
}

function toHomeSummariesResult(data: ListHomeSummariesQuery | null | undefined): HomeSummariesResult {
  return {
    persons: (data?.listPersons ?? []) as PersonSummaryFragment[],
    cities: (data?.listCities ?? []) as CitySummaryFragment[],
  };
}

