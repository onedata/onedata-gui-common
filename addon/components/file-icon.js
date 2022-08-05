import { computed } from '@ember/object';
import { conditional, raw } from 'ember-awesome-macros';
import OneIconTagged from 'onedata-gui-common/components/one-icon-tagged';
import { FileType, SymbolicLinkTargetType } from 'onedata-gui-common/utils/file';

export default OneIconTagged.extend({
  classNames: ['file-icon', 'tag-right'],
  classNameBindings: ['fileTypeClass', 'tagStatusClass'],

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
      case FileType.Regular:
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

    return this.symbolicLinkTargetType === SymbolicLinkTargetType.Broken ?
      'x' : 'shortcut';
  }),

  /**
   * @override
   */
  shadowType: conditional('tagIcon', raw('circle'), raw('none')),

  /**
   * @type {ComputedProperty<FileType>}
   */
  effectiveFileType: computed(
    'fileType',
    'symbolicLinkTargetType',
    function effectiveFileType() {
      return this.fileType === FileType.SymbolicLink ?
        this.symbolicLinkTargetType : this.fileType;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  fileTypeClass: computed('fileType', function fileTypeClass() {
    switch (this.fileType) {
      case FileType.Regular:
        return 'type-regular';
      case FileType.Directory:
        return 'type-directory';
      case FileType.SymbolicLink:
        return 'type-symbolic-link';
    }
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  tagStatusClass: computed('symbolicLinkTargetType', function tagStatusClass() {
    return this.symbolicLinkTargetType === SymbolicLinkTargetType.Broken ?
      'danger' : '';
  }),
});
