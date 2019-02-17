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
      return response.json();
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
      return response.json();
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
    const queryParameters = new URLSearchParams();
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
      return response.json();
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
      return response.json();
    });
  }

}