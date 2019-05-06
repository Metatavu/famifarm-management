import { Batch, BatchPhase } from "famifarm-typescript-models";
import * as URI from "urijs";
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
    const uri = new URI(`${this.basePath}/v1/batches`);
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
   * @summary Deletes a batch
   * @param batchId BatchId
  */
  public deleteBatch(batchId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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
   * @summary Find a batch
   * @param batchId Batch id
  */
  public findBatch(batchId: string, ):Promise<Batch> {
    const uri = new URI(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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
  * @summary List all batches
  * @param status Filters list by derived batch status.
  * @param phase Filters list by phase
  * @param productId Filters list by product id
  * @param firstResult Where to start listing
  * @param maxResult How many items to return at one time
  * @param createdBefore Created before time
  * @param createdAfter Created after time
 */
 public listBatches(status?: string, phase?: BatchPhase, productId?: string, firstResult?: number, maxResult?: number, createdBefore?: string, createdAfter?: string, ):Promise<Array<Batch>> {
   const uri = new URI(`${this.basePath}/v1/batches`);
   if (status !== undefined && status !== null) {
       uri.addQuery('status', <any>status);
   }
   if (phase !== undefined && phase !== null) {
       uri.addQuery('phase', <any>phase);
   }
   if (productId !== undefined && productId !== null) {
       uri.addQuery('productId', <any>productId);
   }
   if (firstResult !== undefined && firstResult !== null) {
       uri.addQuery('firstResult', <any>firstResult);
   }
   if (maxResult !== undefined && maxResult !== null) {
       uri.addQuery('maxResult', <any>maxResult);
   }
   if (createdBefore !== undefined && createdBefore !== null) {
       uri.addQuery('createdBefore', <any>createdBefore);
   }
   if (createdAfter !== undefined && createdAfter !== null) {
       uri.addQuery('createdAfter', <any>createdAfter);
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
   * @summary Updates a batch
   * @param body Request payload
   * @param batchId Batch id
  */
  public updateBatch(body: Batch, batchId: string, ):Promise<Batch> {
    const uri = new URI(`${this.basePath}/v1/batches/${encodeURIComponent(String(batchId))}`);
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