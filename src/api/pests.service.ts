import { Pest } from "famifarm-typescript-models";
import { Api } from ".";

export class PestsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new pest
   * @param body Pest to be added
  */
  public createPest(body: Pest, ):Promise<Pest> {
    const url = new URL(`${this.basePath}/v1/pests`);
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(url.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Deletes a pest
   * @param pestId Pest id
  */
  public deletePest(pestId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
    const options = {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Find a pest
   * @param pestId Pest id
  */
  public findPest(pestId: string, ):Promise<Pest> {
    const url = new URL(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary List all pests
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listPests(firstResult?: number, maxResults?: number, ):Promise<Array<Pest>> {
    const url = new URL(`${this.basePath}/v1/pests`);
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
      return Api.handleResponse(response);
    });
  }


  /**
   * 
   * @summary Updates a pest
   * @param body Request payload
   * @param pestId Pest id
  */
  public updatePest(body: Pest, pestId: string, ):Promise<Pest> {
    const url = new URL(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
    const options = {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    };

    return fetch(url.toString(), options).then((response) => {
      return Api.handleResponse(response);
    });
  }

}