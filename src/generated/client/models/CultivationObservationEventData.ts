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
 * @interface CultivationObservationEventData
 */
export interface CultivationObservationEventData {
    /**
     * Weight in grams
     * @type {number}
     * @memberof CultivationObservationEventData
     */
    weight?: number;
    /**
     * List of ids pests observed
     * @type {Array<string>}
     * @memberof CultivationObservationEventData
     */
    pestIds?: Array<string>;
    /**
     * Luminance in lumens on the time of observation
     * @type {number}
     * @memberof CultivationObservationEventData
     */
    luminance?: number;
    /**
     * List of ids of cultivation actions done based on observations
     * @type {Array<string>}
     * @memberof CultivationObservationEventData
     */
    performedActionIds?: Array<string>;
}

export function CultivationObservationEventDataFromJSON(json: any): CultivationObservationEventData {
    return CultivationObservationEventDataFromJSONTyped(json, false);
}

export function CultivationObservationEventDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): CultivationObservationEventData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'weight': !exists(json, 'weight') ? undefined : json['weight'],
        'pestIds': !exists(json, 'pestIds') ? undefined : json['pestIds'],
        'luminance': !exists(json, 'luminance') ? undefined : json['luminance'],
        'performedActionIds': !exists(json, 'performedActionIds') ? undefined : json['performedActionIds'],
    };
}

export function CultivationObservationEventDataToJSON(value?: CultivationObservationEventData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'weight': value.weight,
        'pestIds': value.pestIds,
        'luminance': value.luminance,
        'performedActionIds': value.performedActionIds,
    };
}

