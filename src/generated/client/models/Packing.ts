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
    PackingState,
    PackingStateFromJSON,
    PackingStateFromJSONTyped,
    PackingStateToJSON,
    PackingType,
    PackingTypeFromJSON,
    PackingTypeFromJSONTyped,
    PackingTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface Packing
 */
export interface Packing {
    /**
     * 
     * @type {string}
     * @memberof Packing
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Packing
     */
    productId?: string;
    /**
     * 
     * @type {string}
     * @memberof Packing
     */
    campaignId?: string;
    /**
     * 
     * @type {Date}
     * @memberof Packing
     */
    time: Date;
    /**
     * Amount of created packages
     * @type {number}
     * @memberof Packing
     */
    packedCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Packing
     */
    packageSizeId?: string;
    /**
     * 
     * @type {PackingState}
     * @memberof Packing
     */
    state: PackingState;
    /**
     * 
     * @type {PackingType}
     * @memberof Packing
     */
    type: PackingType;
}

export function PackingFromJSON(json: any): Packing {
    return PackingFromJSONTyped(json, false);
}

export function PackingFromJSONTyped(json: any, ignoreDiscriminator: boolean): Packing {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'productId': !exists(json, 'productId') ? undefined : json['productId'],
        'campaignId': !exists(json, 'campaignId') ? undefined : json['campaignId'],
        'time': (new Date(json['time'])),
        'packedCount': !exists(json, 'packedCount') ? undefined : json['packedCount'],
        'packageSizeId': !exists(json, 'packageSizeId') ? undefined : json['packageSizeId'],
        'state': PackingStateFromJSON(json['state']),
        'type': PackingTypeFromJSON(json['type']),
    };
}

export function PackingToJSON(value?: Packing | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'productId': value.productId,
        'campaignId': value.campaignId,
        'time': (value.time.toISOString()),
        'packedCount': value.packedCount,
        'packageSizeId': value.packageSizeId,
        'state': PackingStateToJSON(value.state),
        'type': PackingTypeToJSON(value.type),
    };
}

