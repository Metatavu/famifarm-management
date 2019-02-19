import { SeedBatch } from "famifarm-typescript-models";

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
    const url = new URL(`${this.basePath}/v1/seedBatches`);
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
   * @summary Deletes a seed batch
   * @param seedBatchId SeedBatchId
  */
  public deleteSeedBatch(seedBatchId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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
   * @summary Find a seed batch
   * @param seedBatchId Wastage reason id
  */
  public findSeedBatch(seedBatchId: string, ):Promise<SeedBatch> {
    const url = new URL(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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
   * @summary List all seed batches
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listSeedBatches(firstResult?: number, maxResults?: number, ):Promise<Array<SeedBatch>> {
    const url = new URL(`${this.basePath}/v1/seedBatches`);
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
   * @summary Updates a seed batch
   * @param body Request payload
   * @param seedBatchId Wastage reason id
  */
  public updateSeedBatch(body: SeedBatch, seedBatchId: string, ):Promise<SeedBatch> {
    const url = new URL(`${this.basePath}/v1/seedBatches/${encodeURIComponent(String(seedBatchId))}`);
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