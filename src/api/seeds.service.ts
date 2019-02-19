import { Seed } from "famifarm-typescript-models";

export class SeedsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new seed
   * @param body Seed to be added
  */
  public createSeed(body: Seed, ):Promise<Seed> {
    const url = new URL(`${this.basePath}/v1/seeds`);
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
   * @summary Deletes a seed
   * @param seedId Seed id
  */
  public deleteSeed(seedId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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
   * @summary Find a seed
   * @param seedId Seed id
  */
  public findSeed(seedId: string, ):Promise<Seed> {
    const url = new URL(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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
   * @summary List all seeds
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listSeeds(firstResult?: number, maxResults?: number, ):Promise<Array<Seed>> {
    const url = new URL(`${this.basePath}/v1/seeds`);
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
      return response.json();
    });
  }


  /**
   * 
   * @summary Updates a seed
   * @param body Request payload
   * @param seedId Seed id
  */
  public updateSeed(body: Seed, seedId: string, ):Promise<Seed> {
    const url = new URL(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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