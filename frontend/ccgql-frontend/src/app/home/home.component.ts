import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

import { PersonApiService } from '../graphql/person-api.service';
import { CityApiService } from '../graphql/city-api.service';
import { PersonCardFieldsFragment, CityCardFieldsFragment } from '../../generated/graphql';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly personApi = inject(PersonApiService);
  private readonly cityApi = inject(CityApiService);
  private readonly router = inject(Router);

  readonly persons = signal<PersonCardFieldsFragment[]>([]);
  readonly personsLoading = signal(true);
  readonly personsError = signal<string | null>(null);

  readonly cities = signal<CityCardFieldsFragment[]>([]);
  readonly citiesLoading = signal(true);
  readonly citiesError = signal<string | null>(null);

  ngOnInit(): void {
    this.personApi.listPersonsOverview().subscribe({
      next: (data) => {
        this.persons.set(data);
        this.personsLoading.set(false);
      },
      error: (err) => {
        this.personsError.set(String(err?.message ?? err));
        this.personsLoading.set(false);
      },
    });

    this.cityApi.listCitiesOverview().subscribe({
      next: (data) => {
        this.cities.set(data);
        this.citiesLoading.set(false);
      },
      error: (err) => {
        this.citiesError.set(String(err?.message ?? err));
        this.citiesLoading.set(false);
      },
    });
  }

  navigateToPerson(id: number | null | undefined): void {
    if (id != null) {
      this.router.navigate(['/persons', id]);
    }
  }

  navigateToCity(id: number | null | undefined): void {
    if (id != null) {
      this.router.navigate(['/cities', id]);
    }
  }
}
