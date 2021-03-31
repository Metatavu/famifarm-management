import * as constants from '../constants'
import { KeycloakInstance } from 'keycloak-js';
import { Product, PackageSize, Seed, ProductionLine, SeedBatch, PerformedCultivationAction, WastageReason, Pest, Packing, Campaign, Event } from "../generated/client";
import { ErrorMessage, EventListFilters } from '../types';

export interface UserLogin {
  type: constants.USER_LOGIN;
  keycloak?: KeycloakInstance;
  authenticated: boolean;
}

export interface UserLogout {
  type: constants.USER_LOGOUT;
}

export interface PackingsFound {
  type: constants.PACKINGS_FOUND;
  packings: Packing[];
}

export interface ProductsFound {
  type: constants.PRODUCTS_FOUND;
  products: Product[];
}

export interface ProductSelected {
  type: constants.PRODUCT_SELECTED;
  product: Product;
}

export interface ProductCreated {
  type: constants.PRODUCT_CREATED;
  product: Product;
}

export interface ProductDeleted {
  type: constants.PRODUCT_DELETED;
  productId: string;
}

export interface PackageSizesFound {
  type: constants.PACKAGE_SIZES_FOUND;
  packageSizes: PackageSize[];
}

export interface PackageSizeSelected {
  type: constants.PACKAGE_SIZE_SELECTED;
  packageSize: PackageSize;
}

export interface PackageSizeCreated {
  type: constants.PACKAGE_SIZE_CREATED;
  packageSize: PackageSize;
}

export interface PackageSizeDeleted {
  type: constants.PACKAGE_SIZE_DELETED;
  packageSizeId: string;
}

export interface SeedsFound {
  type: constants.SEEDS_FOUND;
  seeds: Seed[];
}

export interface SeedSelected {
  type: constants.SEED_SELECTED;
  seed: Seed;
}

export interface SeedCreated {
  type: constants.SEED_CREATED;
  seed: Seed;
}

export interface SeedDeleted {
  type: constants.SEED_DELETED;
  seedId: string;
}

export interface ProductionLinesFound {
  type: constants.PRODUCTION_LINES_FOUND;
  productionLines: ProductionLine[];
}

export interface ProductionLineSelected {
  type: constants.PRODUCTION_LINE_SELECTED;
  productionLine: ProductionLine;
}

export interface ProductionLineCreated {
  type: constants.PRODUCTION_LINE_CREATED;
  productionLine: ProductionLine;
}

export interface ProductionLineDeleted {
  type: constants.PRODUCTION_LINE_DELETED;
  productionLineId: string;
}

export interface SeedBatchesFound {
  type: constants.SEED_BATCHES_FOUND;
  seedBatches: SeedBatch[];
}

export interface SeedBatchSelected {
  type: constants.SEED_BATCH_SELECTED;
  seedBatch: SeedBatch;
}

export interface SeedBatchCreated {
  type: constants.SEED_BATCH_CREATED;
  seedBatch: SeedBatch;
}

export interface SeedBatchDeleted {
  type: constants.SEED_BATCH_DELETED;
  seedBatchId: string;
}

export interface PerformedCultivationActionsFound {
  type: constants.PERFORMED_CULTIVATION_ACTIONS_FOUND;
  performedCultivationActions: PerformedCultivationAction[];
}

export interface PerformedCultivationActionSelected {
  type: constants.PERFORMED_CULTIVATION_ACTION_SELECTED;
  performedCultivationAction: PerformedCultivationAction;
}

export interface PerformedCultivationActionCreated {
  type: constants.PERFORMED_CULTIVATION_ACTION_CREATED;
  performedCultivationAction: PerformedCultivationAction;
}

export interface PerformedCultivationActionDeleted {
  type: constants.PERFORMED_CULTIVATION_ACTION_DELETED;
  performedCultivationActionId: string;
}
/**
 * Locale update data
 */
export interface LocaleUpdate {
  type: constants.LOCALE_UPDATE,
  locale: string
}

/**
 * Interface representing WastageReasonsFound action
 */
export interface WastageReasonsFound {
  type: constants.WASTAGE_REASONS_FOUND;
  wastageReasons: WastageReason[];
}

/**
 * Interface representing WastageReasonSelected action
 */
export interface WastageReasonSelected {
  type: constants.WASTAGE_REASON_SELECTED;
  wastageReason: WastageReason;
}

/**
 * Interface representing WastageReasonCreated action
 */
export interface WastageReasonCreated {
  type: constants.WASTAGE_REASON_CREATED;
  wastageReason: WastageReason;
}

/**
 * Interface representing WastageReasonDeleted action
 */
export interface WastageReasonDeleted {
  type: constants.WASTAGE_REASON_DELETED;
  wastageReasonId: string;
}

export interface PestsFound {
  type: constants.PESTS_FOUND;
  pests: Pest[];
}

/**
 * Interface representing ErrorOccurred action
 */
export interface ErrorOccurred {
  type: constants.ERROR_OCCURRED;
  error?: ErrorMessage;
}

/**
 * Interface representing CampaignsFound action
 */
export interface CampaignsFound {
  type: constants.CAMPAIGNS_FOUND;
  campaigns: Campaign[]
}

export interface EventListFiltersUpdated {
  type: constants.EVENT_LIST_FILTERS_UPDATED;
  eventListFilters: EventListFilters
}

export interface EventsFound {
  type: constants.EVENTS_FOUND;
  events: Event[];
}



export type AppAction = UserLogin | UserLogout
  | ProductsFound | ProductSelected | ProductCreated | ProductDeleted | PackageSizesFound 
  | PackageSizeSelected | PackageSizeCreated | PackageSizeDeleted | SeedsFound | SeedCreated
  | SeedSelected | SeedDeleted | ProductionLinesFound | ProductionLineSelected | ProductionLineCreated
  | ProductionLineDeleted | SeedBatchesFound | SeedBatchSelected | SeedBatchCreated | SeedBatchDeleted
  | PerformedCultivationActionsFound | PerformedCultivationActionSelected | PerformedCultivationActionCreated
  | PerformedCultivationActionDeleted | LocaleUpdate | WastageReasonsFound | WastageReasonSelected | EventsFound
  | WastageReasonCreated | WastageReasonDeleted| PestsFound | ErrorOccurred | PackingsFound | CampaignsFound | EventListFiltersUpdated;

  /**
   * Redux store update method for campaigns
   * 
   * @param campaigns campaigns
   */
export function campaignsFound(campaigns: Campaign[]): CampaignsFound {
  return {
    type: constants.CAMPAIGNS_FOUND,
    campaigns
  }
}

export function userLogin(keycloak: KeycloakInstance, authenticated: boolean): UserLogin {
  return {
    type: constants.USER_LOGIN,
    keycloak: keycloak,
    authenticated: authenticated
  }
}

export function userLogout(): UserLogout {
  return {
    type: constants.USER_LOGOUT
  }
}

export function packingsFound(packings: Packing[]): PackingsFound {
  return {
    type: constants.PACKINGS_FOUND,
    packings: packings
  }
}

export function productsFound(products: Product[]): ProductsFound {
  return {
    type: constants.PRODUCTS_FOUND,
    products: products
  }
}

export function productSelected(product: Product): ProductSelected {
  return {
    type: constants.PRODUCT_SELECTED,
    product: product
  }
}

export function productCreated(product: Product): ProductCreated {
  return {
    type: constants.PRODUCT_CREATED,
    product: product
  }
}

export function productDeleted(productId: string): ProductDeleted {
  return {
    type: constants.PRODUCT_DELETED,
    productId: productId
  }
}

export function packageSizesFound(packageSizes: PackageSize[]): PackageSizesFound {
  return {
    type: constants.PACKAGE_SIZES_FOUND,
    packageSizes: packageSizes
  }
}

export function packageSizeSelected(packageSize: PackageSize): PackageSizeSelected {
  return {
    type: constants.PACKAGE_SIZE_SELECTED,
    packageSize: packageSize
  }
}

export function packageSizeCreated(packageSize: PackageSize): PackageSizeCreated {
  return {
    type: constants.PACKAGE_SIZE_CREATED,
    packageSize: packageSize
  }
}

export function packageSizeDeleted(packageSizeId: string): PackageSizeDeleted {
  return {
    type: constants.PACKAGE_SIZE_DELETED,
    packageSizeId: packageSizeId
  }
}

export function seedsFound(seeds: Seed[]): SeedsFound {
  return {
    type: constants.SEEDS_FOUND,
    seeds: seeds
  }
}

export function seedSelected(seed: Seed): SeedSelected {
  return {
    type: constants.SEED_SELECTED,
    seed: seed
  }
}

export function seedCreated(seed: Seed): SeedCreated {
  return {
    type: constants.SEED_CREATED,
    seed: seed
  }
}

export function seedDeleted(seedId: string): SeedDeleted {
  return {
    type: constants.SEED_DELETED,
    seedId: seedId
  }
}

export function productionLinesFound(productionLines: ProductionLine[]): ProductionLinesFound {
  return {
    type: constants.PRODUCTION_LINES_FOUND,
    productionLines: productionLines
  }
}

export function productionLineSelected(productionLine: ProductionLine): ProductionLineSelected {
  return {
    type: constants.PRODUCTION_LINE_SELECTED,
    productionLine: productionLine
  }
}

export function productionLineCreated(productionLine: ProductionLine): ProductionLineCreated {
  return {
    type: constants.PRODUCTION_LINE_CREATED,
    productionLine: productionLine
  }
}

export function productionLineDeleted(productionLineId: string): ProductionLineDeleted {
  return {
    type: constants.PRODUCTION_LINE_DELETED,
    productionLineId: productionLineId
  }
}

export function seedBatchesFound(seedBatches: SeedBatch[]): SeedBatchesFound {
  return {
    type: constants.SEED_BATCHES_FOUND,
    seedBatches: seedBatches
  }
}

export function seedBatchSelected(seedBatch: SeedBatch): SeedBatchSelected {
  return {
    type: constants.SEED_BATCH_SELECTED,
    seedBatch: seedBatch
  }
}

export function seedBatchCreated(seedBatch: SeedBatch): SeedBatchCreated {
  return {
    type: constants.SEED_BATCH_CREATED,
    seedBatch: seedBatch
  }
}

export function seedBatchDeleted(seedBatchId: string): SeedBatchDeleted {
  return {
    type: constants.SEED_BATCH_DELETED,
    seedBatchId: seedBatchId
  }
}

export function performedCultivationActionsFound(performedCultivationActions: PerformedCultivationAction[]): PerformedCultivationActionsFound {
  return {
    type: constants.PERFORMED_CULTIVATION_ACTIONS_FOUND,
    performedCultivationActions: performedCultivationActions
  }
}

export function performedCultivationActionSelected(performedCultivationAction: PerformedCultivationAction): PerformedCultivationActionSelected {
  return {
    type: constants.PERFORMED_CULTIVATION_ACTION_SELECTED,
    performedCultivationAction: performedCultivationAction
  }
}

export function performedCultivationActionCreated(performedCultivationAction: PerformedCultivationAction): PerformedCultivationActionCreated {
  return {
    type: constants.PERFORMED_CULTIVATION_ACTION_CREATED,
    performedCultivationAction: performedCultivationAction
  }
}

export function performedCultivationActionDeleted(performedCultivationActionId: string): PerformedCultivationActionDeleted {
  return {
    type: constants.PERFORMED_CULTIVATION_ACTION_DELETED,
    performedCultivationActionId: performedCultivationActionId
  }
}
/**
 * Store update method for locale
 * 
 * @param locale locale
 */
export function localeUpdate(locale: string): LocaleUpdate {
  return {
    type: constants.LOCALE_UPDATE,
    locale: locale
  }
}

/**
 * Pests found action
 * 
 * @param pests list of pests
 */
export function pestsFound(pests: Pest[]): PestsFound {
  return {
    type: constants.PESTS_FOUND,
    pests: pests
  }
}

/**
 * Action wastageReasonsFound
 * 
 * @param wastageReasons array of wastage reasons
 * @return { type, wastageReasons }
 */
export function wastageReasonsFound(wastageReasons: WastageReason[]): WastageReasonsFound {
  return {
    type: constants.WASTAGE_REASONS_FOUND,
    wastageReasons: wastageReasons
  }
}

/**
 * Action wastageReasonSelected
 * 
 * @param wastageReason wastage reason
 * @return { type, wastageReason }
 */
export function wastageReasonSelected(wastageReason: WastageReason): WastageReasonSelected {
  return {
    type: constants.WASTAGE_REASON_SELECTED,
    wastageReason: wastageReason
  }
}

/**
 * Action wastageReasonCreated
 * 
 * @param wastageReason wastage reason
 * @return { type, wastageReason }
 */
export function wastageReasonCreated(wastageReason: WastageReason): WastageReasonCreated {
  return {
    type: constants.WASTAGE_REASON_CREATED,
    wastageReason: wastageReason
  }
}

/**
 * Action wastageReasonDeleted
 * 
 * @param wastageReasonId wastage reason id
 * @return { type, wastageReasonId }
 */
export function wastageReasonDeleted(wastageReasonId: string): WastageReasonDeleted {
  return {
    type: constants.WASTAGE_REASON_DELETED,
    wastageReasonId: wastageReasonId
  }
}
/**
 * Action onErrorOccurred
 * 
 * @param error error
 * @return { type, error }
 */
export function onErrorOccurred(error?: ErrorMessage): ErrorOccurred {
  return {
    type: constants.ERROR_OCCURRED,
    error: error
  }
}

export function eventListFiltersUpdated(filters: EventListFilters): EventListFiltersUpdated {
  return {
    type: constants.EVENT_LIST_FILTERS_UPDATED,
    eventListFilters: filters
  }
}

export function eventsFound(events: Event[]): EventsFound {
  return {
    type: constants.EVENTS_FOUND,
    events: events
  }
}
