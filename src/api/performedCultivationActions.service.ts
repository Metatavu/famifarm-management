import { PerformedCultivationAction } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class PerformedCultivationActionsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new performed cultivation action
   * @param body Wastage reason to be added
  */
  public createPerformedCultivationAction(body: PerformedCultivationAction, ):Promise<PerformedCultivationAction> {
    const uri = new URI(`${this.basePath}/v1/performedCultivationActions`);
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
   * @summary Deletes a performed cultivation action
   * @param performedCultivationActionId PerformedCultivationActionId
  */
  public deletePerformedCultivationAction(performedCultivationActionId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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
   * @summary Find a performed cultivation action
   * @param performedCultivationActionId Wastage reason id
  */
  public findPerformedCultivationAction(performedCultivationActionId: string, ):Promise<PerformedCultivationAction> {
    const uri = new URI(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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
   * @summary List all performed cultivation actions
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listPerformedCultivationActions(firstResult?: number, maxResults?: number, ):Promise<Array<PerformedCultivationAction>> {
    const uri = new URI(`${this.basePath}/v1/performedCultivationActions`);
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
   * @summary Updates a performed cultivation action
   * @param body Request payload
   * @param performedCultivationActionId Wastage reason id
  */
  public updatePerformedCultivationAction(body: PerformedCultivationAction, performedCultivationActionId: string, ):Promise<PerformedCultivationAction> {
    const uri = new URI(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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