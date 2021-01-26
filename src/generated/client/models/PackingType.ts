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

/**
 * 
 * @export
 * @enum {string}
 */
export enum PackingType {
    Basic = 'BASIC',
    Campaign = 'CAMPAIGN'
}

export function PackingTypeFromJSON(json: any): PackingType {
    return PackingTypeFromJSONTyped(json, false);
}

export function PackingTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): PackingType {
    return json as PackingType;
}

export function PackingTypeToJSON(value?: PackingType | null): any {
    return value as any;
}

