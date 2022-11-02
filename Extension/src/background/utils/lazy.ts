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

/**
 * This function allows cache property in object. Use with javascript getter.
 *
 * var Object = {
 *
 *      get someProperty(){
 *          return lazyGet(Object, 'someProperty', function() {
 *              return calculateSomeProperty();
 *          });
 *      }
 * }
 *
 * @param object Object
 * @param prop Original property name
 * @param calculateFunc Calculation function
 * @returns {*}
 */
export const lazyGet = function (object, prop, calculateFunc) {
    const cachedProp = `_${prop}`;
    if (cachedProp in object) {
        return object[cachedProp];
    }
    const value = calculateFunc.apply(object);
    object[cachedProp] = value;
    return value;
};

/**
 * Clear cached property
 * @param object Object
 * @param prop Original property name
 */
export const lazyGetClear = function (object, prop) {
    delete object[`_${prop}`];
};
