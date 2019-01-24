import { KeycloakInstance } from "keycloak-js";
import { Team } from 'famifarm-client';

export interface StoreState {
  keycloak?: KeycloakInstance;
  authenticated: boolean;
  teams: Team[];
  team: Team;
}
