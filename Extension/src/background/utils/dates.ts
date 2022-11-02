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
 * Util class for dates
 */
export const dates = (function () {
    const DateUtils = {
        isSameHour(a, b) {
            return (
                this.isSameDay(a, b)
                && a.getHours() === b.getHours()
            );
        },
        isSameDay(a, b) {
            return (
                this.isSameMonth(a, b)
                && a.getDate() === b.getDate()
            );
        },
        isSameMonth(a, b) {
            if (!a || !b) {
                return false;
            }

            return (
                a.getYear() === b.getYear()
                && a.getMonth() === b.getMonth()
            );
        },
        getDifferenceInHours(a, b) {
            return (a.getTime() - b.getTime()) / 1000 / 60 / 60;
        },
        getDifferenceInDays(a, b) {
            return this.getDifferenceInHours(a, b) / 24;
        },
        getDifferenceInMonths(a, b) {
            return this.getDifferenceInDays(a, b) / 30;
        },
    };

    return DateUtils;
})();
