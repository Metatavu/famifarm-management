import { 
  Configuration, 
  Team,
  TeamsApi } from "famifarm-client";
import { KeycloakInstance } from "keycloak-js";

export default class FamiFarmApiClient {

  getConfig(keycloak: KeycloakInstance): Configuration {
    const cnf = new Configuration({
      basePath: process.env.REACT_APP_FAMIFARM_API_BASE_PATH,
      apiKey: `Bearer ${keycloak.token}`
    });
    console.log(cnf);
    return cnf; 

  }

  listTeams(keycloak: KeycloakInstance, firstResult: number, maxResults: number): Promise<Team[]> {
    const api = new TeamsApi(this.getConfig(keycloak));
    console.log(api);
    return this.doRequest(keycloak, api.listTeams(firstResult, maxResults));
  }

  findTeam(keycloak: KeycloakInstance, teamId: string): Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).findTeam(teamId));
  }

  createTeam(keycloak: KeycloakInstance, team: Team):  Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).createTeam(team));
  }

  updateTeam(keycloak: KeycloakInstance, team: Team):  Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).updateTeam(team.id!, team));
  }

  deleteTeam(keycloak: KeycloakInstance, teamId: string):  Promise<void> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).deleteTeam(teamId));
  }

  checkTokenValidity(keycloak: KeycloakInstance) {
    return new Promise((resolve, reject) => {
      keycloak.updateToken(5).success(() => {
        resolve();
      }).error(() => {
        reject();
      })
    });
  }

  async doRequest(keycloak: KeycloakInstance, request: Promise<any>) {
    try {
      await this.checkTokenValidity(keycloak);
      return request;
    } catch(e) {
      return Promise.reject(e);
    }
  }
}