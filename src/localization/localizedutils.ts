import { LocalizedValue } from "../generated/client";
import { store } from "../index";

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
    const state = store.getState();
    const facility: string = state.facility;
    const localeFromStore = state.locale;

    if (!entry) {
      return "";
    }

    let locale = localeParam || localeFromStore;
    if (!locale) {
      locale = `en_${facility}`;
    }

    for (let i = 0; i < entry.length; i++) {
      if (entry[i].language === "fi") entry[i].language = `fi_${facility.toLowerCase()}`;
      if (entry[i].language === "en") entry[i].language = `en_${facility.toLowerCase()}`;

      if (locale === entry[i].language) {
        return entry[i].value;
      }
    }

    if (!locale.includes("fi")) {
      // This is currently the only place the localeParam is passed into this function and so no need to update to include facility in the above usage of localeParam.
      return this.getLocalizedValue(entry, `fi_${facility}`);
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