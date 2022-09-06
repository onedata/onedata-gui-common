/**
 * Renders a tagged icon presenting file type. For regular files and directories
 * it is enough to specify `fileType`. In case of symbolic link it is expected
 * to provide also `symbolicLinkTargetType`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { and, eq, conditional, raw } from 'ember-awesome-macros';
import OneIconTagged from 'onedata-gui-common/components/one-icon-tagged';
import { FileType, SymbolicLinkTargetType } from 'onedata-gui-common/utils/file';

const fileTypeToClassString = {
  [FileType.Regular]: 'regular',
  [FileType.Directory]: 'directory',
  [FileType.SymbolicLink]: 'symbolic-link',
};

export default OneIconTagged.extend({
  classNames: ['one-file-icon', 'tag-right'],
  classNameBindings: ['fileTypeClassName', 'isBrokenSymbolicLink:danger'],

  /**
   * @virtual
   * @type {FileType}
   */
  fileType: undefined,

  /**
   * @virtual optional
   * @type {SymbolicLinkTargetType}
   */
  symbolicLinkTargetType: SymbolicLinkTargetType.Regular,

  /**
   * @override
   */
  icon: computed('effectiveFileType', function icon() {
    switch (this.effectiveFileType) {
      case FileType.Directory:
        return 'browser-directory';
      default:
        return 'browser-file';
    }
  }),

  /**
   * @override
   */
  tagIcon: computed('fileType', 'symbolicLinkTargetType', function tagIcon() {
    if (this.fileType !== FileType.SymbolicLink) {
      return null;
    }

    return this.isBrokenSymbolicLink ? 'x' : 'shortcut';
  }),

  /**
   * @override
   */
  shadowType: conditional('tagIcon', raw('circle'), raw('none')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isBrokenSymbolicLink: and(
    eq('fileType', raw(FileType.SymbolicLink)),
    eq('symbolicLinkTargetType', raw(SymbolicLinkTargetType.Broken))
  ),

  /**
   * @type {ComputedProperty<FileType>}
   */
  effectiveFileType: computed(
    'fileType',
    'symbolicLinkTargetType',
    function effectiveFileType() {
      if (this.isBrokenSymbolicLink) {
        return FileType.Regular;
      } else if (this.fileType === FileType.SymbolicLink) {
        return this.symbolicLinkTargetType;
      } else {
        return this.fileType ?? FileType.Regular;
      }
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  fileTypeClassName: computed(
    'fileType',
    'effectiveFileType',
    'isBrokenSymbolicLink',
    function fileTypeClass() {
      const mainTypeString = fileTypeToClassString[this.fileType ?? FileType.Regular];
      const effTypeString = fileTypeToClassString[this.effectiveFileType];
      const extraClasses = this.isBrokenSymbolicLink ? 'symbolic-link-broken' : '';

      return `main-type-${mainTypeString} effective-type-${effTypeString} ${extraClasses}`;
    }
  ),
});
