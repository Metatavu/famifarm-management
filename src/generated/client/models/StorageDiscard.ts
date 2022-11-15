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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface StorageDiscard
 */
export interface StorageDiscard {
    /**
     * 
     * @type {string}
     * @memberof StorageDiscard
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof StorageDiscard
     */
    productId?: string;
    /**
     * 
     * @type {Date}
     * @memberof StorageDiscard
     */
    discardDate?: Date;
    /**
     * 
     * @type {string}
     * @memberof StorageDiscard
     */
    packageSizeId?: string;
    /**
     * 
     * @type {number}
     * @memberof StorageDiscard
     */
    discardAmount?: number;
}

export function StorageDiscardFromJSON(json: any): StorageDiscard {
    return StorageDiscardFromJSONTyped(json, false);
}

export function StorageDiscardFromJSONTyped(json: any, ignoreDiscriminator: boolean): StorageDiscard {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'productId': !exists(json, 'productId') ? undefined : json['productId'],
        'discardDate': !exists(json, 'discardDate') ? undefined : (new Date(json['discardDate'])),
        'packageSizeId': !exists(json, 'packageSizeId') ? undefined : json['packageSizeId'],
        'discardAmount': !exists(json, 'discardAmount') ? undefined : json['discardAmount'],
    };
}

export function StorageDiscardToJSON(value?: StorageDiscard | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'productId': value.productId,
        'discardDate': value.discardDate === undefined ? undefined : (value.discardDate.toISOString()),
        'packageSizeId': value.packageSizeId,
        'discardAmount': value.discardAmount,
    };
}


