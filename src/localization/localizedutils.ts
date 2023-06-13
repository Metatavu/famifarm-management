import { LocalizedValue } from "../generated/client";
import strings from "./strings";

/**
 * Helper class for using localized values
 */
export default class LocalizedUtils {
  /**
   * Returns localized value
   *
   * @param entry localized entry
   * @param locale Locale
   * @returns value
   */
  public static getLocalizedValue(entry?: LocalizedValue[], localeParam?: string): string {
    if (!entry) {
      return "";
    }

    if (!localeParam) {
      localeParam = strings.getLanguage().slice(0, 2);
    }

    for (let i = 0; i < entry.length; i++) {
      if (localeParam === entry[i].language) {
        return entry[i].value;
      }
    }

    if (localeParam !== "fi") {
      return this.getLocalizedValue(entry, "fi");
    }

    return "";
  }

  /**
   * Get facility specific overrides for locale
   *
   * @param locale string
   * @param facility string
   * @returns locales object with facility overrides
   */
  public static getFacilityOverrides = (locale: string, facility: string) => {
    const baseLocale = require(`./${locale}.json`);
    const facilityOverrides = require(`./${locale}.${facility}.json`);

    return { ...baseLocale, ...facilityOverrides };
  }

}