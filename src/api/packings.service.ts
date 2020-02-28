import {Packing, PackingState} from "famifarm-typescript-models";
import * as URI from "urijs";
import {Api} from ".";
export class PackingsService {
    private token: string;
    private basePath: string;

    constructor(basePath: string, token: string) {
        this.token = token;
        this.basePath = basePath;
    }
    
    /**
     * @summary Creates new packing
     * @param body packing to be created
     */
    public createPacking(body:  Packing): Promise<Packing> {
        const uri = new URI(`${this.basePath}/v1/packings`);
        const options = {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            body: JSON.stringify(body)
        };
        console.log(body);
        return fetch(uri.toString(), options).then((response) => {
            return Api.handleResponse(response);
        }).catch(e => {
          console.log(e);
        });
    }

    /**
   * 
   * @summary Deletes a packing
   * @param packingId Packing id
  */
  public deletePacking(packingId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/packings/${encodeURIComponent(String(packingId))}`);
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
   * @summary Find a packing
   * @param packingId Packing id
  */
  public findPacking(packingId: string, ):Promise<Packing> {
    const uri = new URI(`${this.basePath}/v1/packings/${encodeURIComponent(String(packingId))}`);
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
   * @summary List all packings
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
   * @param productId Filter results by product id
   * @param createdBefore Filter results by date
   * @param createdAfter Filter results by date
  */
  public listPackings(firstResult?: number, maxResults?: number, productId?: string, status?: PackingState, createdBefore?: string, createdAfter?: string):Promise<Array<Packing>> {
    const uri = new URI(`${this.basePath}/v1/packings`);
    if (firstResult !== undefined && firstResult !== null) {
        uri.addQuery('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        uri.addQuery('maxResults', <any>maxResults);
    }
    if (productId !== undefined && productId !== null) {
        uri.addQuery('productId', <any>productId);
    }
    if (createdBefore !== undefined && createdBefore !== null) {
        uri.addQuery('createdBefore', <any>createdBefore);
    }
    if (createdAfter !== undefined && createdAfter !== null) {
        uri.addQuery('createdAfter', <any>createdAfter);
    }
    if (status !== undefined && status !== null) {
        uri.addQuery("state", <any>status);
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
   * @summary Updates a packing
   * @param body Request payload
   * @param packingId Packing id
  */
  public updatePacking(body: Packing, packingId: string, ):Promise<Packing> {
    const uri = new URI(`${this.basePath}/v1/packings/${encodeURIComponent(String(packingId))}`);
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