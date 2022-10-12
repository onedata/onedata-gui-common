/**
 * Contains type definitions, data and utils related to "file" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { isAtmDataSpecMatchingFiltersGeneric } from './commons';
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
  superTypes: ['object'],
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
      ?.filter((filter) =>
        filter?.filterType === 'typeOrSupertype' ||
        filter?.filterType === 'typeOrSubtype'
      )
      ?.map((filter) => {
        // This generic way of getting file types from filters works only for
        // filters mentioned in `filter()` above.
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
          default:
            return atmFileTypesArray;
        }
      }) ?? [];

    return {
      allowedFileTypes: _.intersection(allowedFileTypesPerFilter),
    };
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    return isAtmDataSpecMatchingFiltersGeneric(atmDataSpec, filters, context);
  },
};

/**
 * @typedef {'ANY'|FileType} AtmFileType
 */

export const AtmFileType = Object.freeze({
  Any: 'ANY',
  Regular: FileType.Regular,
  Directory: FileType.Directory,
  SymbolicLink: FileType.SymbolicLink,
});

export const atmFileTypesArray = Object.freeze([
  AtmFileType.Any,
  AtmFileType.Regular,
  AtmFileType.Directory,
  AtmFileType.SymbolicLink,
]);

export const atmFileTypeSupertypes = Object.freeze({
  [AtmFileType.Any]: [],
  [AtmFileType.Regular]: [AtmFileType.Any],
  [AtmFileType.Directory]: [AtmFileType.Any],
  [AtmFileType.SymbolicLink]: [AtmFileType.Any],
});

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
 * @param {AtmFileType} fileType
 * @returns {SafeString}
 */
export function translateFileType(i18n, fileType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.file.fileTypes.${fileType}`);
}
