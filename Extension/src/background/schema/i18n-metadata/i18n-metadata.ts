import zod, { z } from 'zod';

import { regularFilterI18nMetadataValidator } from './filter';
import { tagI18nMetadataValidator } from './tag';
import { groupI18nMetadataValidator } from './group';
import { SchemaPreprocessor } from '../preprocessor';

export const filtersI18nRecordValidator = z.record(SchemaPreprocessor.numberValidator, regularFilterI18nMetadataValidator);

export type FiltersI18n = zod.infer<typeof filtersI18nRecordValidator>;

export const groupsI18nRecordValidator = z.record(SchemaPreprocessor.numberValidator, groupI18nMetadataValidator);

export type GroupsI18n = zod.infer<typeof groupsI18nRecordValidator>;

export const tagsI18nRecordValidator = z.record(SchemaPreprocessor.numberValidator, tagI18nMetadataValidator);

export type TagsI18n = zod.infer<typeof tagsI18nRecordValidator>;

export const i18nMetadataValidator = zod.object({
    filters: filtersI18nRecordValidator,
    groups: groupsI18nRecordValidator,
    tags: tagsI18nRecordValidator,
});

export type I18nMetadata = zod.infer<typeof i18nMetadataValidator>;
