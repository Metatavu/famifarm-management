import { Event } from "famifarm-typescript-models";

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
    const url = new URL(`${this.basePath}/v1/events`);
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
   * @summary Deletes an event
   * @param eventId Event id
  */
  public deleteEvent(eventId: string, ):Promise<any> {
    const url = new URL(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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
   * @summary Find an event
   * @param eventId Event id
  */
  public findEvent(eventId: string, ):Promise<Event> {
    const url = new URL(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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
   * @summary List all events
   * @param firstResult First index of results to be returned
   * @param maxResults How many items to return at one time
   * @param batchId Filter results by batch id
  */
  public listEvents(firstResult?: number, maxResults?: number, batchId?: string, ):Promise<Array<Event>> {
    const url = new URL(`${this.basePath}/v1/events`);
    let queryParameters = new URLSearchParams();
    if (firstResult !== undefined && firstResult !== null) {
        queryParameters.set('firstResult', <any>firstResult);
    }
    if (maxResults !== undefined && maxResults !== null) {
        queryParameters.set('maxResults', <any>maxResults);
    }
    if (batchId !== undefined && batchId !== null) {
        queryParameters.set('batchId', <any>batchId);
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
   * @summary Updates an event
   * @param body Request payload
   * @param eventId Event id
  */
  public updateEvent(body: Event, eventId: string, ):Promise<Event> {
    const url = new URL(`${this.basePath}/v1/events/${encodeURIComponent(String(eventId))}`);
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