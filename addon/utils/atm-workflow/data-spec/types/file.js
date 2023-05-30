/**
 * Contains type definitions, data and utils related to "file" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { typeDefinitionBase } from './commons';
import { FileType } from 'onedata-gui-common/utils/file';

/**
 * @typedef {Object} AtmFileDataSpec
 * @property {'file'} type
 * @property {AtmFileType} fileType
 */

/**
 * @typedef {Object} AtmFileDataSpecParamsConditions
 * @property {Array<AtmFileType>} allowedFileTypes
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmFileDataSpec, AtmFileDataSpecParamsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  supertype: 'object',
  areAtmDataSpecParamsCompatible(
    referenceAtmDataSpec,
    typeOrSubtypeAtmDataSpec,
    ignoreEmpty = false,
  ) {
    if (!referenceAtmDataSpec?.fileType || !typeOrSubtypeAtmDataSpec?.fileType) {
      return ignoreEmpty;
    }

    if (referenceAtmDataSpec.fileType === typeOrSubtypeAtmDataSpec.fileType) {
      return true;
    } else {
      return atmFileTypeSupertypes[typeOrSubtypeAtmDataSpec.fileType]
        ?.includes(referenceAtmDataSpec.fileType) || false;
    }
  },
  getAtmDataSpecParamsConditions(filters) {
    const allowedFileTypesPerFilter = filters
      ?.map((filter) => {
        const filterFileDataSpecs = filter?.types
          ?.filter((type) => type?.type === 'file') ?? [];
        if (!filterFileDataSpecs.length) {
          return atmFileTypesArray;
        }
        const filterFileTypes = filterFileDataSpecs
          .map((type) => type?.fileType ?? AtmFileType.Any);
        switch (filter?.filterType) {
          case 'typeOrSupertype':
            return _.uniq(_.flatten(filterFileTypes.map((fileType) => [
              fileType,
              ...atmFileTypeSupertypes[fileType],
            ])));
          case 'typeOrSubtype':
            return _.uniq(_.flatten(filterFileTypes.map((fileType) => [
              fileType,
              ...atmFileTypeSubtypes[fileType],
            ])));
          case 'forbiddenType': {
            const directlyForbiddenFileTypes = _.uniq(_.flatten(filterFileTypes));
            const indirectlyForbiddenFileTypes = _.uniq(_.flatten(
              directlyForbiddenFileTypes.map((fileType) =>
                atmFileTypeSubtypes[fileType]
              )
            ));
            const allForbiddenFileTypes = _.uniq([
              ...directlyForbiddenFileTypes,
              ...indirectlyForbiddenFileTypes,
            ]);
            return atmFileTypesArray
              .filter((fileType) => !allForbiddenFileTypes.includes(fileType));
          }
          default:
            return atmFileTypesArray;
        }
      }) ?? [];

    const allowedFileTypes = allowedFileTypesPerFilter.length ?
      _.intersection(...allowedFileTypesPerFilter) : atmFileTypesArray;
    const sortedAllowedFileTypes = atmFileTypesArray
      .filter((fileType) => allowedFileTypes.includes(fileType));

    return {
      allowedFileTypes: sortedAllowedFileTypes,
    };
  },
  getDefaultValue() {
    return {
      file_id: '',
    };
  },
});

/**
 * @typedef {'ANY'|FileType} AtmFileType
 */

/**
 * @type {Object<string, AtmFileType>}
 */
export const AtmFileType = Object.freeze({
  Any: 'ANY',
  Regular: FileType.Regular,
  Directory: FileType.Directory,
  SymbolicLink: FileType.SymbolicLink,
});

/**
 * @type {Array<AtmFileType>}
 */
export const atmFileTypesArray = Object.freeze([
  AtmFileType.Any,
  AtmFileType.Regular,
  AtmFileType.Directory,
  AtmFileType.SymbolicLink,
]);

/**
 * @type {Object<AtmFileType, Array<AtmFileType>>}
 */
export const atmFileTypeSupertypes = Object.freeze({
  [AtmFileType.Any]: [],
  [AtmFileType.Regular]: [AtmFileType.Any],
  [AtmFileType.Directory]: [AtmFileType.Any],
  [AtmFileType.SymbolicLink]: [AtmFileType.Any],
});

/**
 * @type {Object<AtmFileType, Array<AtmFileType>>}
 */
export const atmFileTypeSubtypes = Object.freeze({
  [AtmFileType.Any]: [
    AtmFileType.Regular,
    AtmFileType.Directory,
    AtmFileType.SymbolicLink,
  ],
  [AtmFileType.Regular]: [],
  [AtmFileType.Directory]: [],
  [AtmFileType.SymbolicLink]: [],
});

/**
 * @param {Ember.Service} i18n
 * @param {AtmFileType} atmFileType
 * @param {{ upperFirst: boolean }} [options]
 * @returns {SafeString}
 */
export function translateAtmFileType(i18n, atmFileType, { upperFirst = false } = {}) {
  if (!i18n) {
    console.error('translateAtmFileType: i18n is undefined');
    return '';
  }

  const translation = i18n.t(`utils.atmWorkflow.dataSpec.file.fileTypes.${atmFileType}`);
  return upperFirst ? _.upperFirst(translation) : translation;
}

/**
 * @typedef {
 * 'name' |
 * 'type' |
 * 'mode' |
 * 'size' |
 * 'atime' |
 * 'mtime' |
 * 'ctime' |
 * 'owner_id' |
 * 'file_id' |
 * 'parent_id' |
 * 'provider_id' |
 * 'storage_user_id' |
 * 'storage_group_id' |
 * 'shares' |
 * 'hardlinks_count' |
 * 'index'
 * } AtmFileAttribute
 */

/**
 * @type {Object<string, AtmFileAttribute>}
 */
export const AtmFileAttribute = Object.freeze({
  Name: 'name',
  Type: 'type',
  Mode: 'mode',
  Size: 'size',
  Atime: 'atime',
  Mtime: 'mtime',
  Ctime: 'ctime',
  OwnerId: 'owner_id',
  FileId: 'file_id',
  ParentId: 'parent_id',
  ProviderId: 'provider_id',
  StorageUserId: 'storage_user_id',
  StorageGroupId: 'storage_group_id',
  Shares: 'shares',
  HardlinksCount: 'hardlinks_count',
  Index: 'index',
});

/**
 * @type {Array<AtmFileAttribute>}
 */
export const atmFileAttributesArray = Object.freeze([
  AtmFileAttribute.Name,
  AtmFileAttribute.Type,
  AtmFileAttribute.Mode,
  AtmFileAttribute.Size,
  AtmFileAttribute.Atime,
  AtmFileAttribute.Mtime,
  AtmFileAttribute.Ctime,
  AtmFileAttribute.OwnerId,
  AtmFileAttribute.FileId,
  AtmFileAttribute.ParentId,
  AtmFileAttribute.ProviderId,
  AtmFileAttribute.StorageUserId,
  AtmFileAttribute.StorageGroupId,
  AtmFileAttribute.Shares,
  AtmFileAttribute.HardlinksCount,
  AtmFileAttribute.Index,
]);
