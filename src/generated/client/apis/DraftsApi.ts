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
    Draft,
    DraftFromJSON,
    DraftToJSON,
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models';

export interface CreateDraftRequest {
    draft: Draft;
}

export interface DeleteDraftRequest {
    draftId: string;
}

export interface ListDraftsRequest {
    userId: string;
    type: string;
}

/**
 * 
 */
export class DraftsApi extends runtime.BaseAPI {

    /**
     * Create new draft
     */
    async createDraftRaw(requestParameters: CreateDraftRequest): Promise<runtime.ApiResponse<Draft>> {
        if (requestParameters.draft === null || requestParameters.draft === undefined) {
            throw new runtime.RequiredError('draft','Required parameter requestParameters.draft was null or undefined when calling createDraft.');
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
            path: `/v1/drafts`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DraftToJSON(requestParameters.draft),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DraftFromJSON(jsonValue));
    }

    /**
     * Create new draft
     */
    async createDraft(requestParameters: CreateDraftRequest): Promise<Draft> {
        const response = await this.createDraftRaw(requestParameters);
        return await response.value();
    }

    /**
     * Deletes a draft
     */
    async deleteDraftRaw(requestParameters: DeleteDraftRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.draftId === null || requestParameters.draftId === undefined) {
            throw new runtime.RequiredError('draftId','Required parameter requestParameters.draftId was null or undefined when calling deleteDraft.');
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
            path: `/v1/drafts/{draftId}`.replace(`{${"draftId"}}`, encodeURIComponent(String(requestParameters.draftId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a draft
     */
    async deleteDraft(requestParameters: DeleteDraftRequest): Promise<void> {
        await this.deleteDraftRaw(requestParameters);
    }

    /**
     * List all drafts
     */
    async listDraftsRaw(requestParameters: ListDraftsRequest): Promise<runtime.ApiResponse<Array<Draft>>> {
        if (requestParameters.userId === null || requestParameters.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter requestParameters.userId was null or undefined when calling listDrafts.');
        }

        if (requestParameters.type === null || requestParameters.type === undefined) {
            throw new runtime.RequiredError('type','Required parameter requestParameters.type was null or undefined when calling listDrafts.');
        }

        const queryParameters: any = {};

        if (requestParameters.userId !== undefined) {
            queryParameters['userId'] = requestParameters.userId;
        }

        if (requestParameters.type !== undefined) {
            queryParameters['type'] = requestParameters.type;
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
            path: `/v1/drafts`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DraftFromJSON));
    }

    /**
     * List all drafts
     */
    async listDrafts(requestParameters: ListDraftsRequest): Promise<Array<Draft>> {
        const response = await this.listDraftsRaw(requestParameters);
        return await response.value();
    }

}
