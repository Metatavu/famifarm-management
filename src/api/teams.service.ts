import { Team } from "famifarm-typescript-models";

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
    const url = new URL(`${this.basePath}/v1/teams`);
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(url.toString(), options).then((response) => {
      return response.json();
    });
  }


  /**
   * 
   * @summary Deletes a team
   * @param teamId Team id
  */
  public deleteTeam(teamId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return this.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Find a team
   * @param teamId Team id
  */
  public findTeam(teamId: string, ):Promise<Team> {
    const url = new URL(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return this.handleResponse(response);
    });
  }


  /**
   * 
   * @summary List all teams
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listTeams(firstResult?: number, maxResults?: number, ):Promise<Array<Team>> {
    const url = new URL(`${this.basePath}/v1/teams`);
    let queryParameters = new URLSearchParams();
    if (firstResult !== undefined && firstResult !== null) {
        queryParameters.set('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        queryParameters.set('maxResults', <any>maxResults);
    }
    url.search = queryParameters.toString();
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return this.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Updates a team
   * @param body Request payload
   * @param teamId Team id
  */
  public updateTeam(body: Team, teamId: string, ):Promise<Team> {
    const url = new URL(`${this.basePath}/v1/teams/${encodeURIComponent(String(teamId))}`);
    const options = {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(url.toString(), options).then((response) => {
      return this.handleResponse(response);
    });
  }

  /**
   * Handle response from API
   * 
   * @param response response object
   */
  public handleResponse(response: any) {
    switch (response.status) {
      case 204:
        return {};
      default:
        return response.json();
    }
  }

}