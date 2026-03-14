import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  AddressFieldsFragment,
  AddressInput,
  DeleteAddressGQL,
  FindAddressGQL,
  ListAddressesGQL,
  SaveAddressGQL,
} from "../../generated/graphql";

@Injectable({
  providedIn: "root",
})
export class AddressApiService {
  private readonly listAddressesGql = inject(ListAddressesGQL);
  private readonly findAddressGql = inject(FindAddressGQL);
  private readonly saveAddressGql = inject(SaveAddressGQL);
  private readonly deleteAddressGql = inject(DeleteAddressGQL);

  listAddresses(): Observable<AddressFieldsFragment[]> {
    return this.listAddressesGql
      .fetch({ fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.listAddresses ?? []) as AddressFieldsFragment[]));
  }

  watchAddresses(): Observable<AddressFieldsFragment[]> {
    return this.listAddressesGql
      .watch({ fetchPolicy: "cache-and-network" })
      .valueChanges.pipe(map(({ data }) => (data?.listAddresses ?? []) as AddressFieldsFragment[]));
  }

  findAddress(id: number): Observable<AddressFieldsFragment | null> {
    return this.findAddressGql
      .fetch({ variables: { id }, fetchPolicy: "network-only" })
      .pipe(map(({ data }) => (data?.findAddress ?? null) as AddressFieldsFragment | null));
  }

  saveAddress(address: AddressInput): Observable<AddressFieldsFragment> {
    return this.saveAddressGql.mutate({ variables: { person: address } }).pipe(
      map((result) => {
        const savedAddress = result.data?.saveAddress;

        if (!savedAddress) {
          throw new Error("saveAddress returned no data");
        }

        return savedAddress;
      }),
    );
  }

  deleteAddress(id: number): Observable<boolean> {
    return this.deleteAddressGql.mutate({ variables: { id } }).pipe(
      map((result) => {
        const wasDeleted = result.data?.deleteAddress;

        if (typeof wasDeleted !== "boolean") {
          throw new Error("deleteAddress returned no data");
        }

        return wasDeleted;
      }),
    );
  }
}
