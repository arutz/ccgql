import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "persons/new",
    loadComponent: () =>
      import("./person-detail/person-detail.component").then((m) => m.PersonDetailComponent),
  },
  {
    path: "persons/:id",
    loadComponent: () =>
      import("./person-detail/person-detail.component").then((m) => m.PersonDetailComponent),
  },
  {
    path: "cities/new",
    loadComponent: () =>
      import("./city-detail/city-detail.component").then((m) => m.CityDetailComponent),
  },
  {
    path: "cities/:id",
    loadComponent: () =>
      import("./city-detail/city-detail.component").then((m) => m.CityDetailComponent),
  },
  { path: "**", redirectTo: "" },
];

