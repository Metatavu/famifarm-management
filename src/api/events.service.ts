import { Event } from "famifarm-typescript-models";
import * as URI from "urijs";
import { Api } from ".";
export class EventsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Create new event
   * @param body Event to be added
  */
  public createEvent(body: Event, ):Promise<Event> {
    const uri = new URI(`${this.basePath}/v1/events`);
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
   * @summary Deletes an event
   * @param eventId Event id
  */
  public deleteEvent(eventId: string, ):Promise<any> {
    const uri = new URI(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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
   * @summary Find an event
   * @param eventId Event id
  */
  public findEvent(eventId: string, ):Promise<Event> {
    const uri = new URI(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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
   * @summary List all events
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
   * @param batchId Filter results by batch id
  */
  public listEvents(firstResult?: number, maxResults?: number, batchId?: string, ):Promise<Array<Event>> {
    const uri = new URI(`${this.basePath}/v1/events`);
    if (firstResult !== undefined && firstResult !== null) {
        uri.addQuery('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        uri.addQuery('maxResults', <any>maxResults);
    }
    if (batchId !== undefined && batchId !== null) {
        uri.addQuery('batchId', <any>batchId);
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
   * @summary Updates an event
   * @param body Request payload
   * @param eventId Event id
  */
  public updateEvent(body: Event, eventId: string, ):Promise<Event> {
    const uri = new URI(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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