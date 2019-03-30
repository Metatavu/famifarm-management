import { ProductionLine } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class ProductionLinesService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new production line
   * @param body Wastage reason to be added
  */
  public createProductionLine(body: ProductionLine, ):Promise<ProductionLine> {
    const uri = new URI(`${this.basePath}/v1/productionLines`);
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
   * @summary Deletes a production line
   * @param productionLineId ProductionLineId
  */
  public deleteProductionLine(productionLineId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/productionLines/${encodeURIComponent(String(productionLineId))}`);
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
   * @summary Find a production line
   * @param productionLineId Wastage reason id
  */
  public findProductionLine(productionLineId: string, ):Promise<ProductionLine> {
    const uri = new URI(`${this.basePath}/v1/productionLines/${encodeURIComponent(String(productionLineId))}`);
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
   * @summary List all production lines
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listProductionLines(firstResult?: number, maxResults?: number, ):Promise<Array<ProductionLine>> {
    const uri = new URI(`${this.basePath}/v1/productionLines`);
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
   * @summary Updates a production line
   * @param body Request payload
   * @param productionLineId Wastage reason id
  */
  public updateProductionLine(body: ProductionLine, productionLineId: string, ):Promise<ProductionLine> {
    const uri = new URI(`${this.basePath}/v1/productionLines/${encodeURIComponent(String(productionLineId))}`);
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