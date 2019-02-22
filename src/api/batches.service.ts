import { Batch } from "famifarm-typescript-models";
import { Api } from ".";

export class BatchesService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new batch
   * @param body Batch to be added
  */
  public createBatch(body: Batch, ):Promise<Batch> {
    const url = new URL(`${this.basePath}/v1/batches`);
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
   * @summary Deletes a batch
   * @param batchId BatchId
  */
  public deleteBatch(batchId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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
   * @summary Find a batch
   * @param batchId Batch id
  */
  public findBatch(batchId: string, ):Promise<Batch> {
    const url = new URL(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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
   * @summary List all batches
   * @param status Filters list by derived batch status.
   * @param firstResult Where to start listing
   * @param maxResult How many items to return at one time
   * @param createdBefore Created before time
   * @param createdAfter Created after time
  */
  public listBatches(status?: string, firstResult?: number, maxResult?: number, createdBefore?: string, createdAfter?: string, ):Promise<Array<Batch>> {
    const url = new URL(`${this.basePath}/v1/batches`);
    let queryParameters = new URLSearchParams();
    if (status !== undefined && status !== null) {
      queryParameters.set('status', <any>status);
    }
    if (firstResult !== undefined && firstResult !== null) {
      queryParameters.set('firstResult', <any>firstResult);
    }
    if (maxResult !== undefined && maxResult !== null) {
      queryParameters.set('maxResult', <any>maxResult);
    }
    if (createdBefore !== undefined && createdBefore !== null) {
      queryParameters.set('createdBefore', <any>createdBefore);
    }
    if (createdAfter !== undefined && createdAfter !== null) {
      queryParameters.set('createdAfter', <any>createdAfter);
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
   * @summary Updates a batch
   * @param body Request payload
   * @param batchId Batch id
  */
  public updateBatch(body: Batch, batchId: string, ):Promise<Batch> {
    const url = new URL(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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