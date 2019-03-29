import { Team } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class TeamsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new team
   * @param body Team to be added
  */
  public createTeam(body: Team, ):Promise<Team> {
    const uri = new URI(`${this.basePath}/v1/teams`);
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(uri.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Deletes a team
   * @param teamId Team id
  */
  public deleteTeam(teamId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(uri.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Find a team
   * @param teamId Team id
  */
  public findTeam(teamId: string, ):Promise<Team> {
    const uri = new URI(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(uri.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary List all teams
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listTeams(firstResult?: number, maxResults?: number, ):Promise<Array<Team>> {
    const uri = new URI(`${this.basePath}/v1/teams`);
    if (firstResult !== undefined && firstResult !== null) {
        uri.addQuery('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        uri.addQuery('maxResults', <any>maxResults);
    }
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(uri.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Updates a team
   * @param body Request payload
   * @param teamId Team id
  */
  public updateTeam(body: Team, teamId: string, ):Promise<Team> {
    const uri = new URI(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(uri.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }

}