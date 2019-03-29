import { WastageReason } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class WastageReasonsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new wastage reason
   * @param body Wastage reason to be added
  */
  public createWastageReason(body: WastageReason, ):Promise<WastageReason> {
    const uri = new URI(`${this.basePath}/v1/wastageReasons`);
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
   * @summary Deletes an wastage reason
   * @param wastageReasonId WastageReasonId
  */
  public deleteWastageReason(wastageReasonId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/wastageReasons/${encodeURIComponent(String(wastageReasonId))}`);
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
   * @summary Find an wastage reason
   * @param wastageReasonId Wastage reason id
  */
  public findWastageReason(wastageReasonId: string, ):Promise<WastageReason> {
    const uri = new URI(`${this.basePath}/v1/wastageReasons/${encodeURIComponent(String(wastageReasonId))}`);
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
   * @summary List all wastage reasons
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listWastageReasons(firstResult?: number, maxResults?: number, ):Promise<Array<WastageReason>> {
    const uri = new URI(`${this.basePath}/v1/wastageReasons`);
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
   * @summary Updates an wastage reason
   * @param body Request payload
   * @param wastageReasonId Wastage reason id
  */
  public updateWastageReason(body: WastageReason, wastageReasonId: string, ):Promise<WastageReason> {
    const uri = new URI(`${this.basePath}/v1/wastageReasons/${encodeURIComponent(String(wastageReasonId))}`);
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