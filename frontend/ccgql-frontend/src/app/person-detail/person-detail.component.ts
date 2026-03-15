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
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";

import { PersonApiService } from "../graphql/person-api.service";
import { Occupation, PersonFieldsFragment, PersonInput } from "../../generated/graphql";

type DetailMode = "create" | "read" | "edit";

@Component({
  selector: "app-person-detail",
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: "./person-detail.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly personApi = inject(PersonApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<DetailMode>("create");
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  readonly isReadOnly = computed(() => this.mode() === "read");
  readonly isCreateMode = computed(() => this.mode() === "create");

  private personId: number | null = null;

  private originalPerson: PersonFieldsFragment | null = null;

  readonly occupationOptions: { value: Occupation; label: string }[] = [
    { value: Occupation.Artist, label: "Künstler/in" },
    { value: Occupation.Doctor, label: "Arzt/Ärztin" },
    { value: Occupation.Engineer, label: "Ingenieur/in" },
    { value: Occupation.Teacher, label: "Lehrer/in" },
    { value: Occupation.Other, label: "Sonstiges" },
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    phone: ["", Validators.required],
    occupation: [Occupation.Other, Validators.required],
    dateOfBirth: ["", Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");

    if (!idParam) {
      this.mode.set("create");
      return;
    }

    this.personId = parseInt(idParam, 10);
    this.mode.set("read");
    this.loading.set(true);

    this.personApi.findPerson(this.personId).subscribe({
      next: (person) => {
        if (person) {
          this.originalPerson = person;
          this.patchForm(person);
        } else {
          this.error.set("Person nicht gefunden.");
        }
        this.loading.set(false);
        this.form.disable();
      },
      error: () => {
        this.error.set("Fehler beim Laden der Person.");
        this.loading.set(false);
      },
    });
  }

  enableEdit(): void {
    this.mode.set("edit");
    this.form.enable();
  }

  cancelEdit(): void {
    if (this.originalPerson) {
      this.patchForm(this.originalPerson);
    }
    this.mode.set("read");
    this.form.disable();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const person: PersonInput = {
      id: this.personId ?? undefined,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      occupation: raw.occupation,
      dateOfBirth: toIsoInstant(raw.dateOfBirth),
    };

    this.saving.set(true);
    this.error.set(null);

    this.personApi.savePerson(person).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(["/"]);
      },
      error: () => {
        this.error.set("Fehler beim Speichern der Person.");
        this.saving.set(false);
      },
    });
  }

  delete(): void {
    if (this.personId === null) return;

    this.deleting.set(true);
    this.error.set(null);

    this.personApi.deletePerson(this.personId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(["/"]);
      },
      error: () => {
        this.error.set("Fehler beim Löschen der Person.");
        this.deleting.set(false);
      },
    });
  }

  navigateBack(): void {
    this.router.navigate(["/"]);
  }

  private patchForm(person: PersonFieldsFragment): void {
    this.form.patchValue({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      occupation: person.occupation,
      dateOfBirth: toDateInputValue(person.dateOfBirth),
    });
  }
}

/** Converts "YYYY-MM-DD" (from <input type="date">) to an ISO-8601 instant string. */
function toIsoInstant(dateInput: string): string {
  return dateInput ? `${dateInput}T00:00:00.000Z` : dateInput;
}

/** Extracts "YYYY-MM-DD" from an ISO-8601 instant string for use in <input type="date">. */
function toDateInputValue(isoInstant: string): string {
  if (!isoInstant) return "";
  return isoInstant.substring(0, 10);
}
