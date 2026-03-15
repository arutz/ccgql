import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { CityApiService } from "../graphql/city-api.service";
import { PersonApiService } from "../graphql/person-api.service";
import { CityFieldsFragment, PersonSummaryFragment } from "../../generated/graphql";

@Component({
  selector: "app-home",
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: "./home.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly personApi = inject(PersonApiService);
  private readonly cityApi = inject(CityApiService);

  readonly persons = signal<PersonSummaryFragment[]>([]);
  readonly cities = signal<CityFieldsFragment[]>([]);
  readonly personsLoading = signal(true);
  readonly citiesLoading = signal(true);
  readonly personsError = signal(false);
  readonly citiesError = signal(false);

  ngOnInit(): void {
    this.personApi.listPersonsSummary().subscribe({
      next: (persons) => {
        this.persons.set(persons);
        this.personsLoading.set(false);
      },
      error: () => {
        this.personsError.set(true);
        this.personsLoading.set(false);
      },
    });

    this.cityApi.listCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.citiesLoading.set(false);
      },
      error: () => {
        this.citiesError.set(true);
        this.citiesLoading.set(false);
      },
    });
  }
}
