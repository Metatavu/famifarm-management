import { Draft } from "famifarm-typescript-models";
import { Api } from ".";

export class DraftsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new draft
   * @param body Draft body
  */
  public createDraft(body: Draft, ):Promise<Draft> {
    const url = new URL(`${this.basePath}/v1/drafts`);
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
   * @summary Deletes a draft
   * @param draftId Draft id
  */
  public deleteDraft(draftId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/drafts/${encodeURIComponent(String(draftId))}`);
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
   * @summary List all drafts
   * @param userId User id who&#39;s drafts are beign listed
   * @param type Type of draft
  */
  public listDrafts(userId: string, type: string, ):Promise<Array<Draft>> {
    const url = new URL(`${this.basePath}/v1/drafts`);
    let queryParameters = new URLSearchParams();
    if (userId !== undefined && userId !== null) {
      queryParameters.set('userId', <any>userId);
    }
    if (type !== undefined && type !== null) {
      queryParameters.set('type', <any>type);
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

}