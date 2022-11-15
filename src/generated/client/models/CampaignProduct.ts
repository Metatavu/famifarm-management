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
 * @interface CampaignProduct
 */
export interface CampaignProduct {
    /**
     * 
     * @type {string}
     * @memberof CampaignProduct
     */
    productId: string;
    /**
     * 
     * @type {number}
     * @memberof CampaignProduct
     */
    count: number;
}

export function CampaignProductFromJSON(json: any): CampaignProduct {
    return CampaignProductFromJSONTyped(json, false);
}

export function CampaignProductFromJSONTyped(json: any, ignoreDiscriminator: boolean): CampaignProduct {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'productId': json['productId'],
        'count': json['count'],
    };
}

export function CampaignProductToJSON(value?: CampaignProduct | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'productId': value.productId,
        'count': value.count,
    };
}


