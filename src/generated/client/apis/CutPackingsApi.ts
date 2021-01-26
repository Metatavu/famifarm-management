/* tslint:disable */
/* eslint-disable */
/**
 * Famifarm-API
 * Famifarm API specification
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import {
    CutPacking,
    CutPackingFromJSON,
    CutPackingToJSON,
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models';

export interface CreateCutPackingRequest {
    cutPacking: CutPacking;
}

export interface DeleteCutPackingRequest {
    cutPackingId: string;
}

export interface FindCutPackingRequest {
    cutPackingId: string;
}

export interface ListCutPackingsRequest {
    firstResult?: number;
    maxResults?: number;
    productId?: string;
    createdBefore?: string;
    createdAfter?: string;
}

export interface UpdateCutPackingRequest {
    cutPacking: CutPacking;
    cutPackingId: string;
}

/**
 * 
 */
export class CutPackingsApi extends runtime.BaseAPI {

    /**
     * Create a new cut packing
     */
    async createCutPackingRaw(requestParameters: CreateCutPackingRequest): Promise<runtime.ApiResponse<CutPacking>> {
        if (requestParameters.cutPacking === null || requestParameters.cutPacking === undefined) {
            throw new runtime.RequiredError('cutPacking','Required parameter requestParameters.cutPacking was null or undefined when calling createCutPacking.');
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
            path: `/v1/cutPackings`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CutPackingToJSON(requestParameters.cutPacking),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => CutPackingFromJSON(jsonValue));
    }

    /**
     * Create a new cut packing
     */
    async createCutPacking(requestParameters: CreateCutPackingRequest): Promise<CutPacking> {
        const response = await this.createCutPackingRaw(requestParameters);
        return await response.value();
    }

    /**
     * Deletes a cut packing
     */
    async deleteCutPackingRaw(requestParameters: DeleteCutPackingRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.cutPackingId === null || requestParameters.cutPackingId === undefined) {
            throw new runtime.RequiredError('cutPackingId','Required parameter requestParameters.cutPackingId was null or undefined when calling deleteCutPacking.');
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
            path: `/v1/cutPackings/{cutPackingId}`.replace(`{${"cutPackingId"}}`, encodeURIComponent(String(requestParameters.cutPackingId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a cut packing
     */
    async deleteCutPacking(requestParameters: DeleteCutPackingRequest): Promise<void> {
        await this.deleteCutPackingRaw(requestParameters);
    }

    /**
     * Find a cut packing
     */
    async findCutPackingRaw(requestParameters: FindCutPackingRequest): Promise<runtime.ApiResponse<CutPacking>> {
        if (requestParameters.cutPackingId === null || requestParameters.cutPackingId === undefined) {
            throw new runtime.RequiredError('cutPackingId','Required parameter requestParameters.cutPackingId was null or undefined when calling findCutPacking.');
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
            path: `/v1/cutPackings/{cutPackingId}`.replace(`{${"cutPackingId"}}`, encodeURIComponent(String(requestParameters.cutPackingId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => CutPackingFromJSON(jsonValue));
    }

    /**
     * Find a cut packing
     */
    async findCutPacking(requestParameters: FindCutPackingRequest): Promise<CutPacking> {
        const response = await this.findCutPackingRaw(requestParameters);
        return await response.value();
    }

    /**
     * List all cut packings
     */
    async listCutPackingsRaw(requestParameters: ListCutPackingsRequest): Promise<runtime.ApiResponse<Array<CutPacking>>> {
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

        if (requestParameters.createdBefore !== undefined) {
            queryParameters['createdBefore'] = requestParameters.createdBefore;
        }

        if (requestParameters.createdAfter !== undefined) {
            queryParameters['createdAfter'] = requestParameters.createdAfter;
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
            path: `/v1/cutPackings`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(CutPackingFromJSON));
    }

    /**
     * List all cut packings
     */
    async listCutPackings(requestParameters: ListCutPackingsRequest): Promise<Array<CutPacking>> {
        const response = await this.listCutPackingsRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates a cut packing
     */
    async updateCutPackingRaw(requestParameters: UpdateCutPackingRequest): Promise<runtime.ApiResponse<CutPacking>> {
        if (requestParameters.cutPacking === null || requestParameters.cutPacking === undefined) {
            throw new runtime.RequiredError('cutPacking','Required parameter requestParameters.cutPacking was null or undefined when calling updateCutPacking.');
        }

        if (requestParameters.cutPackingId === null || requestParameters.cutPackingId === undefined) {
            throw new runtime.RequiredError('cutPackingId','Required parameter requestParameters.cutPackingId was null or undefined when calling updateCutPacking.');
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
            path: `/v1/cutPackings/{cutPackingId}`.replace(`{${"cutPackingId"}}`, encodeURIComponent(String(requestParameters.cutPackingId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: CutPackingToJSON(requestParameters.cutPacking),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => CutPackingFromJSON(jsonValue));
    }

    /**
     * Updates a cut packing
     */
    async updateCutPacking(requestParameters: UpdateCutPackingRequest): Promise<CutPacking> {
        const response = await this.updateCutPackingRaw(requestParameters);
        return await response.value();
    }

}
