import { Draft } from "famifarm-typescript-models";
import * as URI from "urijs";
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
    const uri = new URI(`${this.basePath}/v1/drafts`);
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
   * @summary Deletes a draft
   * @param draftId Draft id
  */
  public deleteDraft(draftId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/drafts/${encodeURIComponent(String(draftId))}`);
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
   * @summary List all drafts
   * @param userId User id who&#39;s drafts are beign listed
   * @param type Type of draft
  */
  public listDrafts(userId: string, type: string, ):Promise<Array<Draft>> {
    const uri = new URI(`${this.basePath}/v1/drafts`);
    if (userId !== undefined && userId !== null) {
        uri.addQuery('userId', <any>userId);
    }
    if (type !== undefined && type !== null) {
        uri.addQuery('type', <any>type);
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

}