import { Campaign } from "famifarm-typescript-models";
import { Api } from ".";
import * as URI from "urijs";

export class CampaignsService {
  private token: string;
  private basePath: string;

  constructor (basePath: string, token: string) {
    this.basePath = basePath;
    this.token = token;
  }

  /**
   * @summary Create a new campaign
   * @param body A campaign to be created
   * 
   * @returns A promise for a created campaign
   */
  public createCampaign(body: Campaign): Promise<Campaign> {
    const uri = new URI(`${this.basePath}/v1/campaigns`);
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
   * @summary List campaigns
   * 
   * @returns A promise for a list of campaigns
   */
  public listCampaigns(): Promise<Array<Campaign>> {
    const uri = new URI(`${this.basePath}/v1/campaigns`);
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
   * @summary Update a campaign
   * @param body An updated campaign
   *
   * @returns A promise for an updated campaign
   */
  public updateCampaign(body: Campaign, campaignId: string): Promise<Campaign> {
    const uri = new URI(`${this.basePath}/v1/campaigns/${encodeURIComponent(campaignId)}`);
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

  /**
   * 
   * @summary Find a campaign
   * @param campaignId Campaign id
   * 
   * @returns Promise for a found campaign
   */
  public findCampaign(campaignId: string ):Promise<Campaign> {
    const uri = new URI(`${this.basePath}/v1/campaigns/${encodeURIComponent(campaignId)}`);
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
   * @summary Deletes a campaign
   * @param campaignId Campaign id
   */
  public deleteCampaign(campaignId: string):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/campaigns/${encodeURIComponent(campaignId)}`);
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
}