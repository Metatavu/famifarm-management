import strings from "./strings";
import { LocalizedEntry } from "famifarm-typescript-models";

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
  public static getLocalizedValue(entry?: LocalizedEntry, localeParam?: string): string {
    if (!entry) {
      return "";
    }

    let locale = localeParam || strings.getLanguage();
    if (!locale) {
      locale = "en";
    }

    for (let i = 0; i < entry.length; i++) {
      if (locale === entry[i].language) {
        return entry[i].value;
      }
    }

    if (locale != "fi") {
      return this.getLocalizedValue(entry, "fi");
    }
    
    return "";
  }

}

