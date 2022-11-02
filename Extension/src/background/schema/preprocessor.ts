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
import zod from 'zod';

/**
 * In some cases we want to preprocessing input before validation
 * For example, cast stringified value to needed type
 */
export class SchemaPreprocessor {
    public static booleanValidator = zod.preprocess(
        SchemaPreprocessor.castStringToBoolean,
        zod.boolean(),
    );

    public static numberValidator = zod.preprocess(
        SchemaPreprocessor.castStringToNumber,
        zod.number(),
    );

    private static castStringToNumber(value: unknown) {
        if (typeof value === 'string') {
            return Number(value);
        }

        return value;
    }

    private static castStringToBoolean(value: unknown) {
        if (typeof value === 'string') {
            try {
                return Boolean(JSON.parse(value));
            } catch (e) {
                return value;
            }
        }

        return value;
    }
}
