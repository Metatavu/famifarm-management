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
 * @interface SeedBatch
 */
export interface SeedBatch {
    /**
     * 
     * @type {string}
     * @memberof SeedBatch
     */
    id?: string;
    /**
     * Manufacturer's code for the batch
     * @type {string}
     * @memberof SeedBatch
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof SeedBatch
     */
    seedId?: string;
    /**
     * Time when the seed has arrived
     * @type {Date}
     * @memberof SeedBatch
     */
    time?: Date;
    /**
     * if seed batch is active
     * @type {boolean}
     * @memberof SeedBatch
     */
    active?: boolean;
}

export function SeedBatchFromJSON(json: any): SeedBatch {
    return SeedBatchFromJSONTyped(json, false);
}

export function SeedBatchFromJSONTyped(json: any, ignoreDiscriminator: boolean): SeedBatch {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'code': !exists(json, 'code') ? undefined : json['code'],
        'seedId': !exists(json, 'seedId') ? undefined : json['seedId'],
        'time': !exists(json, 'time') ? undefined : (new Date(json['time'])),
        'active': !exists(json, 'active') ? undefined : json['active'],
    };
}

export function SeedBatchToJSON(value?: SeedBatch | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'code': value.code,
        'seedId': value.seedId,
        'time': value.time === undefined ? undefined : (value.time.toISOString()),
        'active': value.active,
    };
}


