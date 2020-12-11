import { Product } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class ProductsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new product
   * @param body Product to be added
  */
  public createProduct(body: Product, ):Promise<Product> {
    const uri = new URI(`${this.basePath}/v1/products`);
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
   * @summary Deletes a product
   * @param productId Product id
  */
  public deleteProduct(productId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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
   * @summary Find a product
   * @param productId Product id
  */
  public findProduct(productId: string, ):Promise<Product> {
    const uri = new URI(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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
   * @summary List all products
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
   * @param includeSubcontractorProducts should subcontractor products be included
  */
  public listProducts(firstResult?: number, maxResults?: number, includeSubcontractorProducts?: boolean):Promise<Array<Product>> {
    const uri = new URI(`${this.basePath}/v1/products`);
    if (firstResult !== undefined && firstResult !== null) {
        uri.addQuery('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        uri.addQuery('maxResults', <any>maxResults);
    }
    if (includeSubcontractorProducts !== undefined && includeSubcontractorProducts !== null) {
      uri.addQuery('includeSubcontractorProducts', <any>includeSubcontractorProducts);
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
   * @summary Updates a product
   * @param body Request payload
   * @param productId Product id
  */
  public updateProduct(body: Product, productId: string, ):Promise<Product> {
    const uri = new URI(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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