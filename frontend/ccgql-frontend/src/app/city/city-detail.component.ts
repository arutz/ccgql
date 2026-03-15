import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { CityApiService } from '../graphql/city-api.service';
import { CityFieldsFragment } from '../../generated/graphql';

type Mode = 'create' | 'view' | 'edit';

@Component({
  selector: 'app-city-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './city-detail.component.html',
  styleUrl: './city-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cityApi = inject(CityApiService);

  readonly mode = signal<Mode>('view');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly cityId = signal<number | null>(null);

  readonly isCreateMode = computed(() => this.mode() === 'create');
  readonly isViewMode = computed(() => this.mode() === 'view');
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === null) {
      this.mode.set('create');
      this.form.enable();
    } else {
      const id = Number(idParam);
      this.cityId.set(id);
      this.mode.set('view');
      this.form.disable();
      this.loadCity(id);
    }
  }

  private loadCity(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.cityApi.findCity(id).subscribe({
      next: (city) => {
        if (city) {
          this.fillForm(city);
        } else {
          this.error.set('Stadt nicht gefunden.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err?.message ?? err));
        this.loading.set(false);
      },
    });
  }

  private fillForm(city: CityFieldsFragment): void {
    this.form.patchValue({
      name: city.name,
      country: city.country,
    });
  }

  startEdit(): void {
    this.mode.set('edit');
    this.form.enable();
  }

  cancelEdit(): void {
    const id = this.cityId();
    if (id !== null) {
      this.mode.set('view');
      this.form.disable();
      this.loadCity(id);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const id = this.cityId();
    this.saving.set(true);
    this.error.set(null);

    this.cityApi
      .saveCity({
        ...(id !== null ? { id } : {}),
        name: raw.name,
        country: raw.country,
      })
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          if (this.isCreateMode()) {
            this.router.navigate(['/cities', saved.id]);
          } else {
            this.cityId.set(saved.id ?? null);
            this.fillForm(saved);
            this.mode.set('view');
            this.form.disable();
          }
        },
        error: (err) => {
          this.error.set(String(err?.message ?? err));
          this.saving.set(false);
        },
      });
  }

  delete(): void {
    const id = this.cityId();
    if (id === null) return;

    this.deleting.set(true);
    this.error.set(null);

    this.cityApi.deleteCity(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(String(err?.message ?? err));
        this.deleting.set(false);
      },
    });
  }

  cancelCreate(): void {
    this.router.navigate(['/']);
  }
}
