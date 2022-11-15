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
 * @interface Printer
 */
export interface Printer {
    /**
     * 
     * @type {string}
     * @memberof Printer
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Printer
     */
    name: string;
}

export function PrinterFromJSON(json: any): Printer {
    return PrinterFromJSONTyped(json, false);
}

export function PrinterFromJSONTyped(json: any, ignoreDiscriminator: boolean): Printer {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
    };
}

export function PrinterToJSON(value?: Printer | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
    };
}


