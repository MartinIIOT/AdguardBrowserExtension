import zod from 'zod';

import { customFiltersConfigValidator } from './custom-filters';
import { userFilterValidator } from './user-filter';
import { allowlistValidator } from './allowlist';

// Adguard filters configuration

export const enum FiltersOption {
    EnabledGroups = 'enabled-groups',
    EnabledFilters = 'enabled-filters',
    CustomFilters = 'custom-filters',
    UserFilter = 'user-filter',
    Allowlist = 'whitelist',
}

export const filtersConfigValidator = zod.object({
    [FiltersOption.EnabledGroups]: zod.array(zod.number().int()),
    [FiltersOption.EnabledFilters]: zod.array(zod.number().int()),
    [FiltersOption.CustomFilters]: customFiltersConfigValidator,
    [FiltersOption.UserFilter]: userFilterValidator,
    [FiltersOption.Allowlist]: allowlistValidator,
});

export type FiltersConfig = zod.infer<typeof filtersConfigValidator>;
