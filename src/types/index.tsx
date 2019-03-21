import { KeycloakInstance } from "keycloak-js";
import { Team, Product, PackageSize, Seed, ProductionLine, SeedBatch, PerformedCultivationAction, Batch, WastageReason, Pest } from "famifarm-typescript-models";

export interface StoreState {
  keycloak?: KeycloakInstance
  authenticated: boolean
  teams: Team[]
  team: Team
  products: Product[]
  product: Product
  packageSizes: PackageSize[]
  packageSize: PackageSize
  seeds: Seed[]
  seed: Seed
  productionLines: ProductionLine[]
  productionLine: ProductionLine
  seedBatches: SeedBatch[]
  seedBatch: SeedBatch
  performedCultivationAction: PerformedCultivationAction
  performedCultivationActions: PerformedCultivationAction[]
  batches: Batch[]
  locale: string
  wastageReason: WastageReason
  wastageReasons: WastageReason[]
  pests: Pest[],
  error: ErrorMessage
}

/**
 * An interface describing an error message
 */
export interface ErrorMessage {
  title?: string,
  message?: string,
  exception?: Error
}