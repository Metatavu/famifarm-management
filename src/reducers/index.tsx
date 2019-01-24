import { AppAction } from '../actions';
import { StoreState } from '../types/index';
import { USER_LOGIN, USER_LOGOUT, TEAMS_FOUND, TEAM_SELECTED, TEAM_DELETED } from '../constants/index';

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
  }
  return state;
}