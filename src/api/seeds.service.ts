import { Seed } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
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
    const uri = new URI(`${this.basePath}/v1/seeds`);
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
   * @summary Deletes a seed
   * @param seedId Seed id
  */
  public deleteSeed(seedId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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
   * @summary Find a seed
   * @param seedId Seed id
  */
  public findSeed(seedId: string, ):Promise<Seed> {
    const uri = new URI(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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
   * @summary List all seeds
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listSeeds(firstResult?: number, maxResults?: number, ):Promise<Array<Seed>> {
    const uri = new URI(`${this.basePath}/v1/seeds`);
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
   * @summary Updates a seed
   * @param body Request payload
   * @param seedId Seed id
  */
  public updateSeed(body: Seed, seedId: string, ):Promise<Seed> {
    const uri = new URI(`${this.basePath}/v1/seeds/${encodeURIComponent(String(seedId))}`);
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