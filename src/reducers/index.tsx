import { AppAction } from '../actions';
import { StoreState } from '../types/index';
import { 
  USER_LOGIN, 
  USER_LOGOUT, 
  TEAMS_FOUND, 
  TEAM_SELECTED, 
  TEAM_DELETED,
  PRODUCTS_FOUND, 
  PRODUCT_SELECTED, 
  PRODUCT_DELETED,
  PACKAGE_SIZES_FOUND,
  PACKAGE_SIZE_DELETED,
  PACKAGE_SIZE_SELECTED } from '../constants/index';

export function processAction(state: StoreState, action: AppAction): StoreState {
  switch (action.type) {
    case USER_LOGIN:
      return { ...state, keycloak: action.keycloak, authenticated: action.authenticated};
    case USER_LOGOUT:
      return { ...state, keycloak: undefined, authenticated: false };
    case TEAMS_FOUND:
      return { ...state, teams: action.teams };
    case TEAM_SELECTED:
      return { ...state, team: action.team};
    case TEAM_DELETED:
      return { ...state,  teams: (state.teams || []).filter((team) => {return team.id !== action.teamId})};
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
  }
  return state;
}