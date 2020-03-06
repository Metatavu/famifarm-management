import { SeedBatch } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class SeedBatchesService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new seed batch
   * @param body Wastage reason to be added
  */
  public createSeedBatch(body: SeedBatch, ):Promise<SeedBatch> {
    const uri = new URI(`${this.basePath}/v1/seedBatches`);
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
   * @summary Deletes a seed batch
   * @param seedBatchId SeedBatchId
  */
  public deleteSeedBatch(seedBatchId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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
   * @summary Find a seed batch
   * @param seedBatchId Wastage reason id
  */
  public findSeedBatch(seedBatchId: string, ):Promise<SeedBatch> {
    const uri = new URI(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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
   * @summary List all seed batches
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listSeedBatches(firstResult?: number, maxResults?: number, active?: boolean ):Promise<Array<SeedBatch>> {
    const uri = new URI(`${this.basePath}/v1/seedBatches`);
    if (firstResult !== undefined && firstResult !== null) {
      uri.addQuery('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
      uri.addQuery('maxResults', <any>maxResults);
    }
    if (active !== undefined && active !== null) {
      uri.addQuery("active", <any>active);
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
   * @summary Updates a seed batch
   * @param body Request payload
   * @param seedBatchId Wastage reason id
  */
  public updateSeedBatch(body: SeedBatch, seedBatchId: string, ):Promise<SeedBatch> {
    const uri = new URI(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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