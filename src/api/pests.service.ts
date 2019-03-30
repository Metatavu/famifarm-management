import { Pest } from "famifarm-typescript-models";
import * as URI from "urijs";
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
    const uri = new URI(`${this.basePath}/v1/pests`);
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
   * @summary Deletes a pest
   * @param pestId Pest id
  */
  public deletePest(pestId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
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
   * @summary Find a pest
   * @param pestId Pest id
  */
  public findPest(pestId: string, ):Promise<Pest> {
    const uri = new URI(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
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
   * @summary List all pests
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listPests(firstResult?: number, maxResults?: number, ):Promise<Array<Pest>> {
    const uri = new URI(`${this.basePath}/v1/pests`);
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
   * @summary Updates a pest
   * @param body Request payload
   * @param pestId Pest id
  */
  public updatePest(body: Pest, pestId: string, ):Promise<Pest> {
    const uri = new URI(`${this.basePath}/v1/pests/${encodeURIComponent(String(pestId))}`);
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