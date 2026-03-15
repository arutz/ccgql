import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { HomeApiService } from "../graphql/home-api.service";
import { CitySummaryFragment, PersonSummaryFragment } from "../../generated/graphql";

@Component({
  selector: "app-home",
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: "./home.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly homeApi = inject(HomeApiService);

  readonly persons = signal<PersonSummaryFragment[]>([]);
  readonly cities = signal<CitySummaryFragment[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.homeApi.listHomeSummaries().subscribe({
      next: ({ persons, cities }) => {
        this.persons.set(persons);
        this.cities.set(cities);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Fehler beim Laden der Übersicht.");
        this.loading.set(false);
      },
    });
  }
}
