import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";

import { AddressApiService } from "../graphql/address-api.service";
import { PersonApiService } from "../graphql/person-api.service";
import {
  AddressFieldsFragment,
  AddressInput,
  CityFieldsFragment,
  Occupation,
  PersonFieldsFragment,
  PersonInput,
} from "../../generated/graphql";

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressApi = inject(AddressApiService);
  private readonly personApi = inject(PersonApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<DetailMode>("create");
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly addresses = signal<AddressFieldsFragment[]>([]);
  readonly addressesLoading = signal(false);
  readonly addressSaving = signal(false);
  readonly addressError = signal<string | null>(null);
  readonly deletingAddressIds = signal<number[]>([]);
  readonly cities = signal<CityFieldsFragment[]>([]);
  readonly citiesLoading = signal(false);
  readonly citiesError = signal<string | null>(null);
  readonly personAvailable = signal(false);

  readonly hasSavedPerson = computed(() => this.personAvailable() && this.personId() !== null);
  readonly sortedCities = computed(() =>
    [...this.cities()].sort((left, right) => left.name.localeCompare(right.name, "de")),
  );

  private readonly personId = signal<number | null>(null);

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

  readonly addressForm = this.fb.group({
    street: this.fb.nonNullable.control("", Validators.required),
    zipCode: this.fb.nonNullable.control("", Validators.required),
    state: this.fb.nonNullable.control("", Validators.required),
    cityId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      this.loadPersonFromRoute(paramMap.get("id"));
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

    const isCreateMode = this.personId() === null;
    const raw = this.form.getRawValue();
    const person: PersonInput = {
      id: this.personId() ?? undefined,
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
      next: (savedPerson) => {
        this.saving.set(false);
        this.originalPerson = savedPerson;

        const savedPersonId = savedPerson.id ?? this.personId();

        if (savedPersonId === null || savedPersonId === undefined) {
          this.error.set("Die Person wurde gespeichert, konnte aber nicht geladen werden.");
          return;
        }

        this.personId.set(savedPersonId);
        this.personAvailable.set(true);
        this.patchForm(savedPerson);
        this.mode.set("read");
        this.form.disable();

        if (isCreateMode) {
          this.router.navigate(["/persons", savedPersonId]);
          return;
        }
      },
      error: () => {
        this.error.set("Fehler beim Speichern der Person.");
        this.saving.set(false);
      },
    });
  }

  addAddress(): void {
    const personId = this.personId();

    if (personId === null) {
      this.addressError.set("Bitte speichern Sie die Person zuerst, bevor Sie eine Adresse hinzufügen.");
      return;
    }

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const raw = this.addressForm.getRawValue();

    if (raw.cityId === null) {
      this.addressForm.controls.cityId.markAsTouched();
      return;
    }

    const address: AddressInput = {
      personId,
      street: raw.street.trim(),
      zipCode: raw.zipCode.trim(),
      state: raw.state.trim(),
      cityId: raw.cityId,
    };

    this.addressSaving.set(true);
    this.addressError.set(null);

    this.addressApi.saveAddress(address).subscribe({
      next: (savedAddress) => {
        this.addresses.update((addresses) => [...addresses, savedAddress]);
        this.addressSaving.set(false);
        this.resetAddressForm();
      },
      error: () => {
        this.addressError.set("Fehler beim Hinzufügen der Adresse.");
        this.addressSaving.set(false);
      },
    });
  }

  deleteAddress(addressId: number | null | undefined): void {
    if (addressId === null || addressId === undefined) {
      return;
    }

    this.deletingAddressIds.update((addressIds) => [...addressIds, addressId]);
    this.addressError.set(null);

    this.addressApi.deleteAddress(addressId).subscribe({
      next: () => {
        this.addresses.update((addresses) => addresses.filter((address) => address.id !== addressId));
        this.removeDeletingAddressId(addressId);
      },
      error: () => {
        this.addressError.set("Fehler beim Löschen der Adresse.");
        this.removeDeletingAddressId(addressId);
      },
    });
  }

  delete(): void {
    const personId = this.personId();

    if (personId === null) {
      return;
    }

    this.deleting.set(true);
    this.error.set(null);

    this.personApi.deletePerson(personId).subscribe({
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

  isDeletingAddress(addressId: number | null | undefined): boolean {
    return addressId !== null && addressId !== undefined && this.deletingAddressIds().includes(addressId);
  }

  cityLabel(cityId: number): string {
    const city = this.cities().find((entry) => entry.id === cityId);

    return city ? `${city.name}, ${city.country}` : `Stadt #${cityId}`;
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

  private loadPersonFromRoute(idParam: string | null): void {
    this.error.set(null);
    this.addressError.set(null);
    this.citiesError.set(null);
    this.personAvailable.set(false);
    this.addresses.set([]);
    this.cities.set([]);
    this.addressesLoading.set(false);
    this.citiesLoading.set(false);
    this.resetAddressForm();

    if (!idParam) {
      this.personId.set(null);
      this.originalPerson = null;
      this.mode.set("create");
      this.loading.set(false);
      this.resetPersonForm();
      this.form.enable();
      return;
    }

    const personId = Number.parseInt(idParam, 10);

    if (Number.isNaN(personId)) {
      this.personId.set(null);
      this.originalPerson = null;
      this.mode.set("create");
      this.error.set("Ungültige Personen-ID.");
      this.loading.set(false);
      this.resetPersonForm();
      this.form.disable();
      return;
    }

    this.personId.set(personId);
    this.mode.set("read");
    this.loading.set(true);
    this.addressesLoading.set(true);
    this.citiesLoading.set(true);

    this.personApi.findPersonDetail(personId).subscribe({
      next: (detail) => {
        this.cities.set(detail.cities);
        this.citiesLoading.set(false);

        if (detail.person) {
          this.personAvailable.set(true);
          this.originalPerson = detail.person;
          this.patchForm(detail.person);
          this.addresses.set(detail.person.addresses);
          this.addressesLoading.set(false);
          this.form.disable();
        } else {
          this.originalPerson = null;
          this.error.set("Person nicht gefunden.");
          this.addressesLoading.set(false);
          this.form.disable();
        }

        this.loading.set(false);
      },
      error: () => {
        this.originalPerson = null;
        this.error.set("Fehler beim Laden der Person.");
        this.addressesLoading.set(false);
        this.citiesLoading.set(false);
        this.loading.set(false);
        this.form.disable();
      },
    });
  }


  private resetPersonForm(): void {
    this.form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      occupation: Occupation.Other,
      dateOfBirth: "",
    });
  }

  private resetAddressForm(): void {
    this.addressForm.reset({
      street: "",
      zipCode: "",
      state: "",
      cityId: null,
    });
  }

  private removeDeletingAddressId(addressId: number): void {
    this.deletingAddressIds.update((addressIds) => addressIds.filter((entry) => entry !== addressId));
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
