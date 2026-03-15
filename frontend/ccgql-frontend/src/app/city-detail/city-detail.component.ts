import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";

import { CityApiService } from "../graphql/city-api.service";
import { CityFieldsFragment, CityInput } from "../../generated/graphql";

type DetailMode = "create" | "read" | "edit";

@Component({
  selector: "app-city-detail",
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: "./city-detail.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cityApi = inject(CityApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<DetailMode>("create");
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  readonly isReadOnly = computed(() => this.mode() === "read");
  readonly isCreateMode = computed(() => this.mode() === "create");

  private cityId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    country: ["", Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");

    if (!idParam) {
      this.mode.set("create");
      return;
    }

    this.cityId = parseInt(idParam, 10);
    this.mode.set("read");
    this.loading.set(true);

    this.cityApi.findCity(this.cityId).subscribe({
      next: (city) => {
        if (city) {
          this.patchForm(city);
        } else {
          this.error.set("Stadt nicht gefunden.");
        }
        this.loading.set(false);
        this.form.disable();
      },
      error: () => {
        this.error.set("Fehler beim Laden der Stadt.");
        this.loading.set(false);
      },
    });
  }

  enableEdit(): void {
    this.mode.set("edit");
    this.form.enable();
  }

  cancelEdit(): void {
    this.mode.set("read");
    this.form.disable();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const city: CityInput = {
      id: this.cityId ?? undefined,
      name: raw.name,
      country: raw.country,
    };

    this.saving.set(true);
    this.error.set(null);

    this.cityApi.saveCity(city).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(["/"]);
      },
      error: () => {
        this.error.set("Fehler beim Speichern der Stadt.");
        this.saving.set(false);
      },
    });
  }

  delete(): void {
    if (this.cityId === null) return;

    this.deleting.set(true);
    this.error.set(null);

    this.cityApi.deleteCity(this.cityId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(["/"]);
      },
      error: () => {
        this.error.set("Fehler beim Löschen der Stadt.");
        this.deleting.set(false);
      },
    });
  }

  navigateBack(): void {
    this.router.navigate(["/"]);
  }

  private patchForm(city: CityFieldsFragment): void {
    this.form.patchValue({
      name: city.name,
      country: city.country,
    });
  }
}
