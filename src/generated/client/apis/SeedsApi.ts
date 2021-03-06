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
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    Seed,
    SeedFromJSON,
    SeedToJSON,
} from '../models';

export interface CreateSeedRequest {
    seed: Seed;
}

export interface DeleteSeedRequest {
    seedId: string;
}

export interface FindSeedRequest {
    seedId: string;
}

export interface ListSeedsRequest {
    firstResult?: number;
    maxResults?: number;
}

export interface UpdateSeedRequest {
    seed: Seed;
    seedId: string;
}

/**
 * 
 */
export class SeedsApi extends runtime.BaseAPI {

    /**
     * Create new seed
     */
    async createSeedRaw(requestParameters: CreateSeedRequest): Promise<runtime.ApiResponse<Seed>> {
        if (requestParameters.seed === null || requestParameters.seed === undefined) {
            throw new runtime.RequiredError('seed','Required parameter requestParameters.seed was null or undefined when calling createSeed.');
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
            path: `/v1/seeds`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SeedToJSON(requestParameters.seed),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedFromJSON(jsonValue));
    }

    /**
     * Create new seed
     */
    async createSeed(requestParameters: CreateSeedRequest): Promise<Seed> {
        const response = await this.createSeedRaw(requestParameters);
        return await response.value();
    }

    /**
     * Deletes a seed
     */
    async deleteSeedRaw(requestParameters: DeleteSeedRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.seedId === null || requestParameters.seedId === undefined) {
            throw new runtime.RequiredError('seedId','Required parameter requestParameters.seedId was null or undefined when calling deleteSeed.');
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
            path: `/v1/seeds/{seedId}`.replace(`{${"seedId"}}`, encodeURIComponent(String(requestParameters.seedId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a seed
     */
    async deleteSeed(requestParameters: DeleteSeedRequest): Promise<void> {
        await this.deleteSeedRaw(requestParameters);
    }

    /**
     * Find a seed
     */
    async findSeedRaw(requestParameters: FindSeedRequest): Promise<runtime.ApiResponse<Seed>> {
        if (requestParameters.seedId === null || requestParameters.seedId === undefined) {
            throw new runtime.RequiredError('seedId','Required parameter requestParameters.seedId was null or undefined when calling findSeed.');
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
            path: `/v1/seeds/{seedId}`.replace(`{${"seedId"}}`, encodeURIComponent(String(requestParameters.seedId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedFromJSON(jsonValue));
    }

    /**
     * Find a seed
     */
    async findSeed(requestParameters: FindSeedRequest): Promise<Seed> {
        const response = await this.findSeedRaw(requestParameters);
        return await response.value();
    }

    /**
     * List all seeds
     */
    async listSeedsRaw(requestParameters: ListSeedsRequest): Promise<runtime.ApiResponse<Array<Seed>>> {
        const queryParameters: any = {};

        if (requestParameters.firstResult !== undefined) {
            queryParameters['firstResult'] = requestParameters.firstResult;
        }

        if (requestParameters.maxResults !== undefined) {
            queryParameters['maxResults'] = requestParameters.maxResults;
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
            path: `/v1/seeds`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(SeedFromJSON));
    }

    /**
     * List all seeds
     */
    async listSeeds(requestParameters: ListSeedsRequest): Promise<Array<Seed>> {
        const response = await this.listSeedsRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates a seed
     */
    async updateSeedRaw(requestParameters: UpdateSeedRequest): Promise<runtime.ApiResponse<Seed>> {
        if (requestParameters.seed === null || requestParameters.seed === undefined) {
            throw new runtime.RequiredError('seed','Required parameter requestParameters.seed was null or undefined when calling updateSeed.');
        }

        if (requestParameters.seedId === null || requestParameters.seedId === undefined) {
            throw new runtime.RequiredError('seedId','Required parameter requestParameters.seedId was null or undefined when calling updateSeed.');
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
            path: `/v1/seeds/{seedId}`.replace(`{${"seedId"}}`, encodeURIComponent(String(requestParameters.seedId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: SeedToJSON(requestParameters.seed),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => SeedFromJSON(jsonValue));
    }

    /**
     * Updates a seed
     */
    async updateSeed(requestParameters: UpdateSeedRequest): Promise<Seed> {
        const response = await this.updateSeedRaw(requestParameters);
        return await response.value();
    }

}
