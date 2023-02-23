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
 * @property {AtmFileValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmFileValueConstraints
 * @property {AtmFileType} fileType
 */

/**
 * @typedef {Object} AtmFileValueConstraintsConditions
 * @property {Array<AtmFileType>} allowedFileTypes
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmFileValueConstraints, AtmFileValueConstraintsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  supertype: 'object',
  isValueConstraintsCompatible(
    referenceConstraints,
    typeOrSubtypeConstraints,
    ignoreEmpty = false,
  ) {
    if (!referenceConstraints?.fileType || !typeOrSubtypeConstraints?.fileType) {
      return ignoreEmpty;
    }

    if (referenceConstraints.fileType === typeOrSubtypeConstraints.fileType) {
      return true;
    } else {
      return atmFileTypeSupertypes[typeOrSubtypeConstraints.fileType]
        ?.includes(referenceConstraints.fileType) || false;
    }
  },
  getValueConstraintsConditions(filters) {
    const allowedFileTypesPerFilter = filters
      ?.map((filter) => {
        const filterFileDataSpecs = filter?.types
          ?.filter((type) => type?.type === 'file') ?? [];
        if (!filterFileDataSpecs.length) {
          return atmFileTypesArray;
        }
        const filterFileTypes = filterFileDataSpecs
          .map((type) => type?.valueConstraints?.fileType ?? AtmFileType.Any);
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
