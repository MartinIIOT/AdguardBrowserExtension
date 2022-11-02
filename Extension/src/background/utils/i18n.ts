/**
 * @file
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adguard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 */
import { collections } from './collections';

/**
 * Simple i18n utils
 */
export const i18n = (function () {
    function isArrayElement(array, elem) {
        return array.indexOf(elem) >= 0;
    }

    function isObjectKey(object, key) {
        return key in object;
    }

    return {
        /**
         * Tries to find locale in the given collection of locales
         * @param locales Collection of locales (array or object)
         * @param locale Locale (e.g. en, en_GB, pt_BR)
         * @returns matched locale from the locales collection or null
         */
        normalize(locales, locale) {
            if (!locale) {
                return null;
            }

            // Transform Language-Country => Language_Country
            locale = locale.replace('-', '_');

            let search;

            if (collections.isArray(locales)) {
                search = isArrayElement;
            } else {
                search = isObjectKey;
            }

            if (search(locales, locale)) {
                return locale;
            }

            // Try to search by the language
            const parts = locale.split('_');
            const language = parts[0];
            if (search(locales, language)) {
                return language;
            }

            return null;
        },
    };
})();
