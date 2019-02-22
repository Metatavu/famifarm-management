import { Product } from "famifarm-typescript-models";
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
    const url = new URL(`${this.basePath}/v1/products`);
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
   * @summary Deletes a product
   * @param productId Product id
  */
  public deleteProduct(productId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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
   * @summary Find a product
   * @param productId Product id
  */
  public findProduct(productId: string, ):Promise<Product> {
    const url = new URL(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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
   * @summary List all products
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listProducts(firstResult?: number, maxResults?: number, ):Promise<Array<Product>> {
    const url = new URL(`${this.basePath}/v1/products`);
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
   * @summary Updates a product
   * @param body Request payload
   * @param productId Product id
  */
  public updateProduct(body: Product, productId: string, ):Promise<Product> {
    const url = new URL(`${this.basePath}/v1/products/${encodeURIComponent(String(productId))}`);
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