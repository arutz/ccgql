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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { PersonApiService } from '../graphql/person-api.service';
import { Occupation, PersonFieldsFragment } from '../../generated/graphql';

type Mode = 'create' | 'view' | 'edit';

@Component({
  selector: 'app-person-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly personApi = inject(PersonApiService);

  readonly mode = signal<Mode>('view');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly personId = signal<number | null>(null);

  readonly isCreateMode = computed(() => this.mode() === 'create');
  readonly isViewMode = computed(() => this.mode() === 'view');
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly occupationOptions: { value: Occupation; label: string }[] = [
    { value: Occupation.Artist, label: 'Künstler/in' },
    { value: Occupation.Doctor, label: 'Arzt/Ärztin' },
    { value: Occupation.Engineer, label: 'Ingenieur/in' },
    { value: Occupation.Other, label: 'Sonstiges' },
    { value: Occupation.Teacher, label: 'Lehrer/in' },
  ];

  readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    occupation: new FormControl<Occupation>(Occupation.Other, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dateOfBirth: new FormControl<Date | null>(null, { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === null) {
      this.mode.set('create');
      this.form.enable();
    } else {
      const id = Number(idParam);
      this.personId.set(id);
      this.mode.set('view');
      this.form.disable();
      this.loadPerson(id);
    }
  }

  private loadPerson(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.personApi.findPerson(id).subscribe({
      next: (person) => {
        if (person) {
          this.fillForm(person);
        } else {
          this.error.set('Person nicht gefunden.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err?.message ?? err));
        this.loading.set(false);
      },
    });
  }

  private fillForm(person: PersonFieldsFragment): void {
    this.form.patchValue({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      occupation: person.occupation,
      dateOfBirth: person.dateOfBirth ? new Date(person.dateOfBirth) : null,
    });
  }

  startEdit(): void {
    this.mode.set('edit');
    this.form.enable();
  }

  cancelEdit(): void {
    const id = this.personId();
    if (id !== null) {
      this.mode.set('view');
      this.form.disable();
      this.loadPerson(id);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dateOfBirth = raw.dateOfBirth instanceof Date
      ? raw.dateOfBirth.toISOString()
      : String(raw.dateOfBirth ?? '');

    const id = this.personId();
    this.saving.set(true);
    this.error.set(null);

    this.personApi
      .savePerson({
        ...(id !== null ? { id } : {}),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phone: raw.phone,
        occupation: raw.occupation,
        dateOfBirth,
      })
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          if (this.isCreateMode()) {
            this.router.navigate(['/persons', saved.id]);
          } else {
            this.personId.set(saved.id ?? null);
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
    const id = this.personId();
    if (id === null) return;

    this.deleting.set(true);
    this.error.set(null);

    this.personApi.deletePerson(id).subscribe({
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
