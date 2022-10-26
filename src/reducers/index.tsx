import { AppAction } from '../actions';
import { StoreState } from '../types/index';
import { 
  USER_LOGIN, 
  USER_LOGOUT,
  PACKINGS_FOUND,
  PRODUCTS_FOUND, 
  PRODUCT_SELECTED, 
  PRODUCT_DELETED,
  PACKAGE_SIZES_FOUND,
  PACKAGE_SIZE_DELETED,
  PACKAGE_SIZE_SELECTED,
  SEEDS_FOUND,
  SEED_DELETED,
  SEED_SELECTED,
  PRODUCTION_LINES_FOUND,
  PRODUCTION_LINE_DELETED,
  PRODUCTION_LINE_SELECTED,
  SEED_BATCHES_FOUND,
  SEED_BATCH_SELECTED,
  SEED_BATCH_DELETED,
  PERFORMED_CULTIVATION_ACTIONS_FOUND,
  PERFORMED_CULTIVATION_ACTION_DELETED,
  PERFORMED_CULTIVATION_ACTION_SELECTED, 
  WASTAGE_REASONS_FOUND,
  WASTAGE_REASON_DELETED,
  WASTAGE_REASON_SELECTED,
  LOCALE_UPDATE,
  PESTS_FOUND,
  ERROR_OCCURRED,
  CAMPAIGNS_FOUND,
  EVENT_LIST_FILTERS_UPDATED,
  EVENTS_FOUND} from '../constants/index';
import { Reducer } from 'redux';

/**
 * Process action 
 * 
 * @param state state
 * @param action action
 */
export const processAction: Reducer<StoreState, AppAction> = (state: StoreState | undefined, action: AppAction): StoreState => {
  if (!state) {
    state = {
      authenticated: false,
      locale: "fi",
      events: [],
      eventListFilters: {},
      campaigns: [],
      packageSize: {} as any,
      packageSizes: [],
      packings: [],
      performedCultivationAction: {} as any,
      performedCultivationActions: [],
      pests: [],
      product: {} as any,
      productionLine: {} as any,
      productionLines: [],
      products: [],
      seed: {} as any,
      seedBatch: {} as any,
      seedBatches: [],
      seeds: [],
      storageDiscards: [],
      wastageReason: {} as any,
      wastageReasons: []
    }
  }
  switch (action.type) {
    case USER_LOGIN:
      return { ...state, keycloak: action.keycloak, authenticated: action.authenticated};
    case USER_LOGOUT:
      return { ...state, keycloak: undefined, authenticated: false };
    case PACKINGS_FOUND:
      return {...state, packings: action.packings};
    case PRODUCTS_FOUND:
      return { ...state, products: action.products };
    case PRODUCT_SELECTED:
      return { ...state, product: action.product};
    case PRODUCT_DELETED:
      return { ...state,  products: (state.products || []).filter((product) => {return product.id !== action.productId})};
    case PACKAGE_SIZES_FOUND:
      return { ...state, packageSizes: action.packageSizes };
    case PACKAGE_SIZE_SELECTED:
      return { ...state, packageSize: action.packageSize};
    case PACKAGE_SIZE_DELETED:
      return { ...state,  packageSizes: (state.packageSizes || []).filter((packageSize) => {return packageSize.id !== action.packageSizeId})};
    case SEEDS_FOUND:
      return { ...state, seeds: action.seeds };
    case SEED_SELECTED:
      return { ...state, seed: action.seed};
    case SEED_DELETED:
      return { ...state,  seeds: (state.seeds || []).filter((seed) => {return seed.id !== action.seedId})};
    case PRODUCTION_LINES_FOUND:
      return { ...state, productionLines: action.productionLines };
    case PRODUCTION_LINE_SELECTED:
      return { ...state, productionLine: action.productionLine};
    case PRODUCTION_LINE_DELETED:
      return { ...state,  productionLines: (state.productionLines || []).filter((productionLine) => {return productionLine.id !== action.productionLineId})};
    case SEED_BATCHES_FOUND:
      return { ...state, seedBatches: action.seedBatches };
    case SEED_BATCH_SELECTED:
      return { ...state, seedBatch: action.seedBatch};
    case SEED_BATCH_DELETED:
      return { ...state,  seedBatches: (state.seedBatches || []).filter((seedBatch) => {return seedBatch.id !== action.seedBatchId})};
    case PERFORMED_CULTIVATION_ACTIONS_FOUND:
      return { ...state, performedCultivationActions: action.performedCultivationActions };
    case PERFORMED_CULTIVATION_ACTION_SELECTED:
      return { ...state, performedCultivationAction: action.performedCultivationAction};
    case PERFORMED_CULTIVATION_ACTION_DELETED:
      return { ...state,  performedCultivationActions: (state.performedCultivationActions || []).filter((performedCultivationAction) => {return performedCultivationAction.id !== action.performedCultivationActionId})};
    case LOCALE_UPDATE:
      const locale = action.locale;
      return {...state, locale: locale};
    case WASTAGE_REASONS_FOUND:
      return { ...state, wastageReasons: action.wastageReasons };
    case WASTAGE_REASON_SELECTED:
      return { ...state, wastageReason: action.wastageReason};
    case WASTAGE_REASON_DELETED:
      return { ...state,  wastageReasons: (state.wastageReasons || []).filter((wastageReason) => {return wastageReason.id !== action.wastageReasonId})};
    case PESTS_FOUND:
      return { ...state, pests: action.pests}
    case ERROR_OCCURRED:
      return { ...state, error: action.error}
    case CAMPAIGNS_FOUND:
      return { ...state, campaigns: action.campaigns }
    case EVENT_LIST_FILTERS_UPDATED:
      return { ...state, eventListFilters: action.eventListFilters }
    case EVENTS_FOUND:
      return { ...state, events: action.events}
    }
  return state;
}