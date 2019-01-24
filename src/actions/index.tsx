import * as constants from '../constants'
import { KeycloakInstance } from 'keycloak-js';
import { Team } from 'famifarm-client';

export interface UserLogin {
  type: constants.USER_LOGIN;
  keycloak?: KeycloakInstance;
  authenticated: boolean;
}

export interface UserLogout {
  type: constants.USER_LOGOUT;
}

export interface TeamsFound {
  type: constants.TEAMS_FOUND;
  teams: Team[];
}

export interface TeamSelected {
  type: constants.TEAM_SELECTED;
  team: Team;
}

export interface TeamCreated {
  type: constants.TEAM_CREATED;
  team: Team;
}

export interface TeamDeleted {
  type: constants.TEAM_DELETED;
  teamId: string;
}


export type AppAction = UserLogin | UserLogout | TeamsFound | TeamSelected | TeamCreated | TeamDeleted;

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

export function teamsFound(teams: Team[]): TeamsFound {
  return {
    type: constants.TEAMS_FOUND,
    teams: teams
  }
}

export function teamSelected(team: Team): TeamSelected {
  return {
    type: constants.TEAM_SELECTED,
    team: team
  }
}

export function teamCreated(team: Team): TeamCreated {
  return {
    type: constants.TEAM_CREATED,
    team: team
  }
}

export function teamDeleted(teamId: string): TeamDeleted {
  return {
    type: constants.TEAM_DELETED,
    teamId: teamId
  }
}
