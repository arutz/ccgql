import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { App } from "./app";

describe("App", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should contain a router outlet", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });

  it("should render the application header", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const toolbar = compiled.querySelector("mat-toolbar");
    const titleLink = compiled.querySelector(".app-title");

    expect(toolbar).toBeTruthy();
    expect(titleLink?.textContent?.trim()).toBe("Codecentric GraphQL SampleApp");
    expect(titleLink?.getAttribute("href")).toBe("/");
  });
});
