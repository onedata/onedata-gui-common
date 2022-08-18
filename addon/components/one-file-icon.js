import { computed } from '@ember/object';
import { and, eq, conditional, raw } from 'ember-awesome-macros';
import OneIconTagged from 'onedata-gui-common/components/one-icon-tagged';
import { FileType, SymbolicLinkTargetType } from 'onedata-gui-common/utils/file';

export default OneIconTagged.extend({
  classNames: ['one-file-icon', 'tag-right'],
  classNameBindings: ['fileTypeClasses', 'isSymbolicLinkBroken:danger'],

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
   * @type {ComputedProperty<boolean>}
   */
  isSymbolicLinkBroken: and(
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
      return this.fileType === FileType.SymbolicLink ?
        this.symbolicLinkTargetType : this.fileType;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  fileTypeClasses: computed(
    'fileType',
    'symbolicLinkTargetType',
    'isSymbolicLinkBroken',
    function fileTypeClass() {
      let mainType;
      let effType;
      switch (this.fileType) {
        case FileType.Directory:
          mainType = effType = 'directory';
          break;
        case FileType.SymbolicLink:
          mainType = 'symbolic-link';
          switch (this.symbolicLinkTargetType) {
            case SymbolicLinkTargetType.Directory:
              effType = 'directory';
              break;
            case SymbolicLinkTargetType.Regular:
            case SymbolicLinkTargetType.Broken:
            default:
              effType = 'regular';
              break;
          }
          break;
        case FileType.Regular:
        default:
          mainType = effType = 'regular';
      }

      const extraClasses = this.isSymbolicLinkBroken ? 'symbolic-link-broken' : '';

      return `main-type-${mainType} effective-type-${effType} ${extraClasses}`;
    }
  ),
});
