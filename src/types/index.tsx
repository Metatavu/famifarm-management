import { KeycloakInstance } from "keycloak-js";
import { Product, PackageSize, Seed, ProductionLine, SeedBatch, PerformedCultivationAction, WastageReason, Pest, Packing, Campaign, EventType, Event, StorageDiscard, Facility } from "../generated/client";

export interface EventListFilters {
  product?: Product,
  date?: Date,
  firstResult?: number
  type?: EventType
  productionLine?: ProductionLine
}

export interface StoreState {
  keycloak?: KeycloakInstance
  authenticated: boolean
  packings: Packing[]
  storageDiscards: StorageDiscard[]
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
  locale: string
  wastageReason: WastageReason
  wastageReasons: WastageReason[]
  pests: Pest[],
  error?: ErrorMessage,
  campaigns: Campaign[],
  eventListFilters: EventListFilters,
  events: Event[],
  facility: Facility
}

/**
 * An interface describing an error message
 */
export interface ErrorMessage {
  title?: string,
  message?: string,
  exception?: Error
}

/**
 * An interface describing packagesize options
 */
 export interface PackageSizeOptions {
  key?: string;
  value?: string;
  text?: string;
}

/**
 * An interface describing visualize packings data
 */
export interface VisualizePackingsData {
  time: number;
  count: number | undefined;
  label?: number;
};