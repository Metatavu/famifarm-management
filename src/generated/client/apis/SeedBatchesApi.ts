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
    Facility,
    FacilityFromJSON,
    FacilityToJSON,
    SeedBatch,
    SeedBatchFromJSON,
    SeedBatchToJSON,
} from '../models';

export interface CreateSeedBatchRequest {
    seedBatch: SeedBatch;
    facility: Facility;
}

export interface DeleteSeedBatchRequest {
    facility: Facility;
    seedBatchId: string;
}

export interface FindSeedBatchRequest {
    facility: Facility;
    seedBatchId: string;
}

export interface ListSeedBatchesRequest {
    facility: Facility;
    firstResult?: number;
    maxResults?: number;
    includePassive?: boolean;
}

export interface UpdateSeedBatchRequest {
    seedBatch: SeedBatch;
    facility: Facility;
    seedBatchId: string;
}

/**
 * 
 */
export class SeedBatchesApi extends runtime.BaseAPI {

    /**
     * Create new seed batch
     */
    async createSeedBatchRaw(requestParameters: CreateSeedBatchRequest): Promise<runtime.ApiResponse<SeedBatch>> {
        if (requestParameters.seedBatch === null || requestParameters.seedBatch === undefined) {
            throw new runtime.RequiredError('seedBatch','Required parameter requestParameters.seedBatch was null or undefined when calling createSeedBatch.');
        }

        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling createSeedBatch.');
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
            path: `/v1/{facility}/seedBatches`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SeedBatchToJSON(requestParameters.seedBatch),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedBatchFromJSON(jsonValue));
    }

    /**
     * Create new seed batch
     */
    async createSeedBatch(requestParameters: CreateSeedBatchRequest): Promise<SeedBatch> {
        const response = await this.createSeedBatchRaw(requestParameters);
        return await response.value();
    }

    /**
     * Deletes a seed batch
     */
    async deleteSeedBatchRaw(requestParameters: DeleteSeedBatchRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling deleteSeedBatch.');
        }

        if (requestParameters.seedBatchId === null || requestParameters.seedBatchId === undefined) {
            throw new runtime.RequiredError('seedBatchId','Required parameter requestParameters.seedBatchId was null or undefined when calling deleteSeedBatch.');
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
            path: `/v1/{facility}/seedBatches/{seedBatchId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"seedBatchId"}}`, encodeURIComponent(String(requestParameters.seedBatchId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a seed batch
     */
    async deleteSeedBatch(requestParameters: DeleteSeedBatchRequest): Promise<void> {
        await this.deleteSeedBatchRaw(requestParameters);
    }

    /**
     * Find a seed batch
     */
    async findSeedBatchRaw(requestParameters: FindSeedBatchRequest): Promise<runtime.ApiResponse<SeedBatch>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling findSeedBatch.');
        }

        if (requestParameters.seedBatchId === null || requestParameters.seedBatchId === undefined) {
            throw new runtime.RequiredError('seedBatchId','Required parameter requestParameters.seedBatchId was null or undefined when calling findSeedBatch.');
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
            path: `/v1/{facility}/seedBatches/{seedBatchId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"seedBatchId"}}`, encodeURIComponent(String(requestParameters.seedBatchId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedBatchFromJSON(jsonValue));
    }

    /**
     * Find a seed batch
     */
    async findSeedBatch(requestParameters: FindSeedBatchRequest): Promise<SeedBatch> {
        const response = await this.findSeedBatchRaw(requestParameters);
        return await response.value();
    }

    /**
     * List all seed batches
     */
    async listSeedBatchesRaw(requestParameters: ListSeedBatchesRequest): Promise<runtime.ApiResponse<Array<SeedBatch>>> {
        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling listSeedBatches.');
        }

        const queryParameters: any = {};

        if (requestParameters.firstResult !== undefined) {
            queryParameters['firstResult'] = requestParameters.firstResult;
        }

        if (requestParameters.maxResults !== undefined) {
            queryParameters['maxResults'] = requestParameters.maxResults;
        }

        if (requestParameters.includePassive !== undefined) {
            queryParameters['includePassive'] = requestParameters.includePassive;
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
            path: `/v1/{facility}/seedBatches`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(SeedBatchFromJSON));
    }

    /**
     * List all seed batches
     */
    async listSeedBatches(requestParameters: ListSeedBatchesRequest): Promise<Array<SeedBatch>> {
        const response = await this.listSeedBatchesRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates a seed batch
     */
    async updateSeedBatchRaw(requestParameters: UpdateSeedBatchRequest): Promise<runtime.ApiResponse<SeedBatch>> {
        if (requestParameters.seedBatch === null || requestParameters.seedBatch === undefined) {
            throw new runtime.RequiredError('seedBatch','Required parameter requestParameters.seedBatch was null or undefined when calling updateSeedBatch.');
        }

        if (requestParameters.facility === null || requestParameters.facility === undefined) {
            throw new runtime.RequiredError('facility','Required parameter requestParameters.facility was null or undefined when calling updateSeedBatch.');
        }

        if (requestParameters.seedBatchId === null || requestParameters.seedBatchId === undefined) {
            throw new runtime.RequiredError('seedBatchId','Required parameter requestParameters.seedBatchId was null or undefined when calling updateSeedBatch.');
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
            path: `/v1/{facility}/seedBatches/{seedBatchId}`.replace(`{${"facility"}}`, encodeURIComponent(String(requestParameters.facility))).replace(`{${"seedBatchId"}}`, encodeURIComponent(String(requestParameters.seedBatchId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: SeedBatchToJSON(requestParameters.seedBatch),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedBatchFromJSON(jsonValue));
    }

    /**
     * Updates a seed batch
     */
    async updateSeedBatch(requestParameters: UpdateSeedBatchRequest): Promise<SeedBatch> {
        const response = await this.updateSeedBatchRaw(requestParameters);
        return await response.value();
    }

}
