import { PackageSize } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class PackageSizesService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new package size
   * @param body Wastage reason to be added
  */
  public createPackageSize(body: PackageSize, ):Promise<PackageSize> {
    const uri = new URI(`${this.basePath}/v1/packageSizes`);
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
   * @summary Deletes a package size
   * @param packageSizeId PackageSizeId
  */
  public deletePackageSize(packageSizeId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/packageSizes/${encodeURIComponent(String(packageSizeId))}`);
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
   * @summary Find a package size
   * @param packageSizeId Wastage reason id
  */
  public findPackageSize(packageSizeId: string, ):Promise<PackageSize> {
    const uri = new URI(`${this.basePath}/v1/packageSizes/${encodeURIComponent(String(packageSizeId))}`);
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
   * @summary List all package sizes
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
  */
  public listPackageSizes(firstResult?: number, maxResults?: number, ):Promise<Array<PackageSize>> {
    const uri = new URI(`${this.basePath}/v1/packageSizes`);
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
   * @summary Updates a package size
   * @param body Request payload
   * @param packageSizeId Wastage reason id
  */
  public updatePackageSize(body: PackageSize, packageSizeId: string, ):Promise<PackageSize> {
    const uri = new URI(`${this.basePath}/v1/packageSizes/${encodeURIComponent(String(packageSizeId))}`);
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