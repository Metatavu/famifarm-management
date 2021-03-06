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
 * @interface PlantingEventData
 */
export interface PlantingEventData {
    /**
     * Production line id
     * @type {string}
     * @memberof PlantingEventData
     */
    productionLineId?: string;
    /**
     * Number of holes in gutter used in planting
     * @type {number}
     * @memberof PlantingEventData
     */
    gutterHoleCount?: number;
    /**
     * How many gutter were used during the planting
     * @type {number}
     * @memberof PlantingEventData
     */
    gutterCount?: number;
    /**
     * How many trays were planted
     * @type {number}
     * @memberof PlantingEventData
     */
    trayCount?: number;
    /**
     * How many workers were doing the planting
     * @type {number}
     * @memberof PlantingEventData
     */
    workerCount?: number;
    /**
     * Sowing date
     * @type {Date}
     * @memberof PlantingEventData
     */
    sowingDate?: Date;
}

export function PlantingEventDataFromJSON(json: any): PlantingEventData {
    return PlantingEventDataFromJSONTyped(json, false);
}

export function PlantingEventDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlantingEventData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'productionLineId': !exists(json, 'productionLineId') ? undefined : json['productionLineId'],
        'gutterHoleCount': !exists(json, 'gutterHoleCount') ? undefined : json['gutterHoleCount'],
        'gutterCount': !exists(json, 'gutterCount') ? undefined : json['gutterCount'],
        'trayCount': !exists(json, 'trayCount') ? undefined : json['trayCount'],
        'workerCount': !exists(json, 'workerCount') ? undefined : json['workerCount'],
        'sowingDate': !exists(json, 'sowingDate') ? undefined : (new Date(json['sowingDate'])),
    };
}

export function PlantingEventDataToJSON(value?: PlantingEventData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'productionLineId': value.productionLineId,
        'gutterHoleCount': value.gutterHoleCount,
        'gutterCount': value.gutterCount,
        'trayCount': value.trayCount,
        'workerCount': value.workerCount,
        'sowingDate': value.sowingDate === undefined ? undefined : (value.sowingDate.toISOString()),
    };
}


