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
} from '../models';

export interface GetReportRequest {
    type: string;
    fromTime?: string;
    toTime?: string;
}

/**
 * 
 */
export class ReportsApi extends runtime.BaseAPI {

    /**
     * Constructs report
     */
    async getReportRaw(requestParameters: GetReportRequest): Promise<runtime.ApiResponse<Blob>> {
        if (requestParameters.type === null || requestParameters.type === undefined) {
            throw new runtime.RequiredError('type','Required parameter requestParameters.type was null or undefined when calling getReport.');
        }

        const queryParameters: any = {};

        if (requestParameters.fromTime !== undefined) {
            queryParameters['fromTime'] = requestParameters.fromTime;
        }

        if (requestParameters.toTime !== undefined) {
            queryParameters['toTime'] = requestParameters.toTime;
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
            path: `/v1/reports/{type}`.replace(`{${"type"}}`, encodeURIComponent(String(requestParameters.type))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.BlobApiResponse(response);
    }

    /**
     * Constructs report
     */
    async getReport(requestParameters: GetReportRequest): Promise<Blob> {
        const response = await this.getReportRaw(requestParameters);
        return await response.value();
    }

}