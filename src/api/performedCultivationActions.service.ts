import { PerformedCultivationAction } from "famifarm-typescript-models";
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
    const url = new URL(`${this.basePath}/v1/performedCultivationActions`);
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
   * @summary Deletes a performed cultivation action
   * @param performedCultivationActionId PerformedCultivationActionId
  */
  public deletePerformedCultivationAction(performedCultivationActionId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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
   * @summary Find a performed cultivation action
   * @param performedCultivationActionId Wastage reason id
  */
  public findPerformedCultivationAction(performedCultivationActionId: string, ):Promise<PerformedCultivationAction> {
    const url = new URL(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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
   * @summary List all performed cultivation actions
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listPerformedCultivationActions(firstResult?: number, maxResults?: number, ):Promise<Array<PerformedCultivationAction>> {
    const url = new URL(`${this.basePath}/v1/performedCultivationActions`);
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
   * @summary Updates a performed cultivation action
   * @param body Request payload
   * @param performedCultivationActionId Wastage reason id
  */
  public updatePerformedCultivationAction(body: PerformedCultivationAction, performedCultivationActionId: string, ):Promise<PerformedCultivationAction> {
    const url = new URL(`${this.basePath}/v1/performedCultivationActions/${encodeURIComponent(String(performedCultivationActionId))}`);
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