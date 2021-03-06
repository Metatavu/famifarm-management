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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface PrintData
 */
export interface PrintData {
    /**
     * 
     * @type {string}
     * @memberof PrintData
     */
    packingId: string;
}

export function PrintDataFromJSON(json: any): PrintData {
    return PrintDataFromJSONTyped(json, false);
}

export function PrintDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): PrintData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'packingId': json['packingId'],
    };
}

export function PrintDataToJSON(value?: PrintData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'packingId': value.packingId,
    };
}


