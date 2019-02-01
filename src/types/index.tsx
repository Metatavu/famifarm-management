import { KeycloakInstance } from "keycloak-js";
import { Team, Product, PackageSize, Seed } from 'famifarm-client';

export interface StoreState {
  keycloak?: KeycloakInstance;
  authenticated: boolean;
  teams: Team[];
  team: Team;
  products: Product[];
  product: Product;
  packageSizes: PackageSize[];
  packageSize: PackageSize;
  seeds: Seed[];
  seed: Seed;
}
