import { KeycloakInstance } from "keycloak-js";
import { Team, Product, PackageSize, Seed, ProductionLine, SeedBatch } from 'famifarm-client';

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
  productionLines: ProductionLine[];
  productionLine: ProductionLine;
  seedBatches: SeedBatch[];
  seedBatch: SeedBatch;
}
