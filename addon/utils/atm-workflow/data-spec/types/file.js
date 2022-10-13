/**
 * Contains type definitions, data and utils related to "file" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { doesAtmDataSpecMatchFilters } from '../filters';
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
export const atmDataSpecTypeDefinition = {
  supertype: 'object',
  canValueConstraintsContain(
    containerConstraints,
    toContainConstraints,
    ignoreEmpty = false,
  ) {
    if (!containerConstraints?.fileType || !toContainConstraints?.fileType) {
      return ignoreEmpty;
    }

    if (containerConstraints.fileType === toContainConstraints.fileType) {
      return true;
    } else {
      return atmFileTypeSupertypes[toContainConstraints.fileType]
        ?.includes(containerConstraints.fileType) || false;
    }
  },
  getValueConstraintsConditions(filters) {
    const allowedFileTypesPerFilter = filters
      ?.map((filter) => {
        const filterFileTypes = filter
          ?.types
          ?.map((type) => type?.valueConstraints?.fileType)
          ?.filter(Boolean);
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
              directlyForbiddenFileTypes.map((fileType) => atmFileTypeSubtypes[fileType])
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
  isMatchingFilters(atmDataSpec, filters, context) {
    return doesAtmDataSpecMatchFilters(atmDataSpec, filters, context);
  },
};

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
