import zod, { z } from 'zod';

import { regularFilterI18nMetadataValidator } from './filter';
import { tagI18nMetadataValidator } from './tag';
import { groupI18nMetadataValidator } from './group';

export const filtersI18nRecordValidator = z.record(z.number(), regularFilterI18nMetadataValidator);

export type FiltersI18n = zod.infer<typeof filtersI18nRecordValidator>;

export const groupsI18nRecordValidator = z.record(z.number(), groupI18nMetadataValidator);

export type GroupsI18n = zod.infer<typeof groupsI18nRecordValidator>;

export const tagsI18nRecordValidator = z.record(z.number(), tagI18nMetadataValidator);

export type TagsI18n = zod.infer<typeof tagsI18nRecordValidator>;

export const i18nMetadataValidator = zod.object({
    filters: filtersI18nRecordValidator,
    groups: groupsI18nRecordValidator,
    tags: tagsI18nRecordValidator,
});

export type I18nMetadata = zod.infer<typeof i18nMetadataValidator>;
