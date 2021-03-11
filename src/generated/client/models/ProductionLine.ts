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
 * @interface ProductionLine
 */
export interface ProductionLine {
    /**
     * 
     * @type {string}
     * @memberof ProductionLine
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ProductionLine
     */
    lineNumber?: string;
    /**
     * 
     * @type {number}
     * @memberof ProductionLine
     */
    defaultGutterHoleCount?: number;
}

export function ProductionLineFromJSON(json: any): ProductionLine {
    return ProductionLineFromJSONTyped(json, false);
}

export function ProductionLineFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProductionLine {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'lineNumber': !exists(json, 'lineNumber') ? undefined : json['lineNumber'],
        'defaultGutterHoleCount': !exists(json, 'defaultGutterHoleCount') ? undefined : json['defaultGutterHoleCount'],
    };
}

export function ProductionLineToJSON(value?: ProductionLine | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'lineNumber': value.lineNumber,
        'defaultGutterHoleCount': value.defaultGutterHoleCount,
    };
}

