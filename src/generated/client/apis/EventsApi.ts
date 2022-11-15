/* tslint:disable */
/* eslint-disable */
/**
 * Famifarm-API
 * Famifarm API specification
 *
 * The version of the OpenAPI document: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import {
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    Event,
    EventFromJSON,
    EventToJSON,
    EventType,
    EventTypeFromJSON,
    EventTypeToJSON,
    Facility,
    FacilityFromJSON,
    FacilityToJSON,
} from '../models';

export interface CreateEventRequest {
    event: Event;
    facility: Facility;
}

export interface DeleteEventRequest {
    facility: Facility;
    eventId: string;
}

export interface FindEventRequest {
    facility: Facility;
    eventId: string;
}

export interface ListEventsRequest {
    facility: Facility;
    firstResult?: number;
    maxResults?: number;
    productId?: string;
    createdAfter?: string;
    createdBefore?: string;
    eventType?: EventType;
}

export interface UpdateEventRequest {
    event: Event;
    facility: Facility;
    eventId: string;
}

/**
 * 
 */
export class EventsApi extends runtime.BaseAPI {

    /**
     * Create new event
     */
    async createEventRaw(requestParameters: CreateEventRequest): Promise<runtime.ApiResponse<Event>> {
        if (requestParameters.event === null || requestParameters.event === undefined) {
            throw new runtime.RequiredError('event','Required parameter requestParameters.event was null or undefined when calling createEvent.');
        }

        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling createEvent.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/{facility}/events`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: EventToJSON(requestParameters.event),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => EventFromJSON(jsonValue));
    }

    /**
     * Create new event
     */
    async createEvent(requestParameters: CreateEventRequest): Promise<Event> {
        const response = await this.createEventRaw(requestParameters);
        return await response.value();
    }

    /**
     * Deletes an event
     */
    async deleteEventRaw(requestParameters: DeleteEventRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling deleteEvent.');
        }

        if (requestParameters.eventId === null || requestParameters.eventId === undefined) {
            throw new runtime.RequiredError('eventId','Required parameter requestParameters.eventId was null or undefined when calling deleteEvent.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/{facility}/events/{eventId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"eventId"}}`, encodeURIComponent(String(requestParameters.eventId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes an event
     */
    async deleteEvent(requestParameters: DeleteEventRequest): Promise<void> {
        await this.deleteEventRaw(requestParameters);
    }

    /**
     * Find an event
     */
    async findEventRaw(requestParameters: FindEventRequest): Promise<runtime.ApiResponse<Event>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling findEvent.');
        }

        if (requestParameters.eventId === null || requestParameters.eventId === undefined) {
            throw new runtime.RequiredError('eventId','Required parameter requestParameters.eventId was null or undefined when calling findEvent.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/{facility}/events/{eventId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"eventId"}}`, encodeURIComponent(String(requestParameters.eventId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => EventFromJSON(jsonValue));
    }

    /**
     * Find an event
     */
    async findEvent(requestParameters: FindEventRequest): Promise<Event> {
        const response = await this.findEventRaw(requestParameters);
        return await response.value();
    }

    /**
     * List all events
     */
    async listEventsRaw(requestParameters: ListEventsRequest): Promise<runtime.ApiResponse<Array<Event>>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling listEvents.');
        }

        const queryParameters: any = {};

        if (requestParameters.firstResult !== undefined) {
            queryParameters['firstResult'] = requestParameters.firstResult;
        }

        if (requestParameters.maxResults !== undefined) {
            queryParameters['maxResults'] = requestParameters.maxResults;
        }

        if (requestParameters.productId !== undefined) {
            queryParameters['productId'] = requestParameters.productId;
        }

        if (requestParameters.createdAfter !== undefined) {
            queryParameters['createdAfter'] = requestParameters.createdAfter;
        }

        if (requestParameters.createdBefore !== undefined) {
            queryParameters['createdBefore'] = requestParameters.createdBefore;
        }

        if (requestParameters.eventType !== undefined) {
            queryParameters['eventType'] = requestParameters.eventType;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/{facility}/events`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(EventFromJSON));
    }

    /**
     * List all events
     */
    async listEvents(requestParameters: ListEventsRequest): Promise<Array<Event>> {
        const response = await this.listEventsRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates an event
     */
    async updateEventRaw(requestParameters: UpdateEventRequest): Promise<runtime.ApiResponse<Event>> {
        if (requestParameters.event === null || requestParameters.event === undefined) {
            throw new runtime.RequiredError('event','Required parameter requestParameters.event was null or undefined when calling updateEvent.');
        }

        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling updateEvent.');
        }

        if (requestParameters.eventId === null || requestParameters.eventId === undefined) {
            throw new runtime.RequiredError('eventId','Required parameter requestParameters.eventId was null or undefined when calling updateEvent.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/{facility}/events/{eventId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"eventId"}}`, encodeURIComponent(String(requestParameters.eventId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: EventToJSON(requestParameters.event),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => EventFromJSON(jsonValue));
    }

    /**
     * Updates an event
     */
    async updateEvent(requestParameters: UpdateEventRequest): Promise<Event> {
        const response = await this.updateEventRaw(requestParameters);
        return await response.value();
    }

}
