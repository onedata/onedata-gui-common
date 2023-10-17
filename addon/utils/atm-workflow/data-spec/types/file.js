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
import { assert } from '@ember/debug';

/**
 * @typedef {Object} AtmFileDataSpec
 * @property {'file'} type
 * @property {AtmFileType} fileType
 * @property {Array<AtmFileAttribute> | null} attributes
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
      fileId: '',
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

assert(
  'atmFileTypesArray must have the same items as AtmFileType enum.',
  _.isEqual(Object.values(AtmFileType).sort(), [...atmFileTypesArray].sort())
);

/**
 * @type {Object<AtmFileType, Array<AtmFileType>>}
 */
export const atmFileTypeSupertypes = Object.freeze({
  [AtmFileType.Any]: [],
  [AtmFileType.Regular]: [AtmFileType.Any],
  [AtmFileType.Directory]: [AtmFileType.Any],
  [AtmFileType.SymbolicLink]: [AtmFileType.Any],
});

assert(
  'Keys of atmFileTypeSupertypes must include all values from AtmFileType enum.',
  _.isEqual(
    Object.values(AtmFileType).sort(),
    Object.keys(atmFileTypeSupertypes).sort()
  )
);

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

assert(
  'Keys of atmFileTypeSubtypes must include all values from AtmFileType enum.',
  _.isEqual(
    Object.values(AtmFileType).sort(),
    Object.keys(atmFileTypeSupertypes).sort()
  )
);

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
 *   'acl' |
 *   'activePermissionsType' |
 *   'atime' |
 *   'conflictingName' |
 *   'ctime' |
 *   'directShareIds' |
 *   'displayGid' |
 *   'displayUid' |
 *   'effDatasetMembership' |
 *   'effDatasetProtectionFlags' |
 *   'effProtectionFlags' |
 *   'effQosMembership' |
 *   'fileId' |
 *   'hardlinkCount' |
 *   'hasCustomMetadata' |
 *   'index' |
 *   'isFullyReplicatedLocally' |
 *   'localReplicationRate' |
 *   'mtime' |
 *   'name' |
 *   'originProviderId' |
 *   'ownerUserId' |
 *   'parentFileId' |
 *   'path' |
 *   'posixPermissions' |
 *   'qosStatus' |
 *   'recallRootFileId' |
 *   'size' |
 *   'symlinkValue' |
 *   'type' |
 * } AtmFileAttribute
 */

/**
 * @type {Object<string, AtmFileAttribute>}
 */
export const AtmFileAttribute = Object.freeze({
  Acl: 'acl',
  ActivePermissionsType: 'activePermissionsType',
  Atime: 'atime',
  ConflictingName: 'conflictingName',
  Ctime: 'ctime',
  DirectShareIds: 'directShareIds',
  DisplayGid: 'displayGid',
  DisplayUid: 'displayUid',
  EffDatasetMembership: 'effDatasetMembership',
  EffDatasetProtectionFlags: 'effDatasetProtectionFlags',
  EffProtectionFlags: 'effProtectionFlags',
  EffQosMembership: 'effQosMembership',
  FileId: 'fileId',
  HardlinkCount: 'hardlinkCount',
  HasCustomMetadata: 'hasCustomMetadata',
  Index: 'index',
  IsFullyReplicatedLocally: 'isFullyReplicatedLocally',
  LocalReplicationRate: 'localReplicationRate',
  Mtime: 'mtime',
  Name: 'name',
  OriginProviderId: 'originProviderId',
  OwnerUserId: 'ownerUserId',
  ParentFileId: 'parentFileId',
  Path: 'path',
  PosixPermissions: 'posixPermissions',
  QosStatus: 'qosStatus',
  RecallRootFileId: 'recallRootFileId',
  Size: 'size',
  SymlinkValue: 'symlinkValue',
  Type: 'type',
});

/**
 * @type {Array<AtmFileAttribute>}
 */
export const atmFileAttributesArray = Object.freeze([
  AtmFileAttribute.Acl,
  AtmFileAttribute.ActivePermissionsType,
  AtmFileAttribute.Atime,
  AtmFileAttribute.ConflictingName,
  AtmFileAttribute.Ctime,
  AtmFileAttribute.DirectShareIds,
  AtmFileAttribute.DisplayGid,
  AtmFileAttribute.DisplayUid,
  AtmFileAttribute.EffDatasetMembership,
  AtmFileAttribute.EffDatasetProtectionFlags,
  AtmFileAttribute.EffProtectionFlags,
  AtmFileAttribute.EffQosMembership,
  AtmFileAttribute.FileId,
  AtmFileAttribute.HardlinkCount,
  AtmFileAttribute.HasCustomMetadata,
  AtmFileAttribute.Index,
  AtmFileAttribute.IsFullyReplicatedLocally,
  AtmFileAttribute.LocalReplicationRate,
  AtmFileAttribute.Mtime,
  AtmFileAttribute.Name,
  AtmFileAttribute.OriginProviderId,
  AtmFileAttribute.OwnerUserId,
  AtmFileAttribute.ParentFileId,
  AtmFileAttribute.Path,
  AtmFileAttribute.PosixPermissions,
  AtmFileAttribute.QosStatus,
  AtmFileAttribute.RecallRootFileId,
  AtmFileAttribute.Size,
  AtmFileAttribute.SymlinkValue,
  AtmFileAttribute.Type,
]);

assert(
  'atmFileAttributesArray must have the same items as AtmFileAttribute enum.',
  _.isEqual(Object.values(AtmFileAttribute).sort(), [...atmFileAttributesArray].sort())
);
