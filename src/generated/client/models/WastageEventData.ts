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
import {
    EventType,
    EventTypeFromJSON,
    EventTypeFromJSONTyped,
    EventTypeToJSON,
} from './';

/**
 * Entry of products has been thrown away
 * @export
 * @interface WastageEventData
 */
export interface WastageEventData {
    /**
     * Id of reason a product has been thrown away
     * @type {string}
     * @memberof WastageEventData
     */
    reasonId: string;
    /**
     * 
     * @type {number}
     * @memberof WastageEventData
     */
    amount: number;
    /**
     * 
     * @type {string}
     * @memberof WastageEventData
     */
    productionLineId?: string;
    /**
     * 
     * @type {EventType}
     * @memberof WastageEventData
     */
    phase: EventType;
}

export function WastageEventDataFromJSON(json: any): WastageEventData {
    return WastageEventDataFromJSONTyped(json, false);
}

export function WastageEventDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): WastageEventData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'reasonId': json['reasonId'],
        'amount': json['amount'],
        'productionLineId': !exists(json, 'productionLineId') ? undefined : json['productionLineId'],
        'phase': EventTypeFromJSON(json['phase']),
    };
}

export function WastageEventDataToJSON(value?: WastageEventData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'reasonId': value.reasonId,
        'amount': value.amount,
        'productionLineId': value.productionLineId,
        'phase': EventTypeToJSON(value.phase),
    };
}


