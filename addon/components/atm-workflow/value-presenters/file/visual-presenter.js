import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/file/visual-presenter';
import { FileType, SymbolicLinkTargetType } from 'onedata-gui-common/utils/file';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'file-visual-presenter', 'details-with-icon'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.file.visualPresenter',

  /**
   * @virtual
   * @type {AtmFile}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<FileDetails>}
   */
  fileDetails: computed('value', 'context', function fileDetails() {
    return FileDetails.create({
      file: this.value,
      context: this.context,
    });
  }),

  /**
   * @type {ComputedProperty<SymbolicLinkTargetType>}
   */
  symbolicLinkTargetType: reads('fileDetails.symbolicLinkTargetType'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  pathProxy: reads('fileDetails.pathProxy'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: reads('fileDetails.urlProxy'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  sizeProxy: reads('fileDetails.sizeProxy'),
});

export const FileDetails = EmberObject.extend({
  /**
   * @virtual
   * @type {AtmFile}
   */
  file: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<AtmFile|null>>}
   */
  symbolicLinkTargetProxy: promise.object(
    computed('file', 'context', async function fileProxy() {
      if (
        !this.context?.getSymbolicLinkTargetById ||
        this.file?.type !== FileType.SymbolicLink ||
        !this.file?.file_id
      ) {
        return null;
      }

      return this.context.getSymbolicLinkTargetById(this.file.file_id);
    })
  ),

  /**
   * @type {ComputedProperty<SymbolicLinkTargetType>}
   */
  symbolicLinkTargetType: computed(
    'symbolicLinkTargetProxy.isSettled',
    'context',
    function sizeProxy() {
      if (
        !this.context?.getSymbolicLinkTargetById ||
        !this.symbolicLinkTargetProxy.isSettled
      ) {
        return SymbolicLinkTargetType.Regular;
      } else {
        return this.symbolicLinkTargetProxy.content?.type ??
          SymbolicLinkTargetType.Broken;
      }
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  pathProxy: promise.object(
    computed('file', 'context', async function pathProxy() {
      if (!this.file?.file_id) {
        return null;
      }

      return this.context?.getFilePathById?.(this.file.file_id) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: promise.object(
    computed('file', 'context', async function urlProxy() {
      if (!this.file?.file_id) {
        return null;
      }

      return this.context?.getFileUrlById?.(this.file.file_id) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  sizeProxy: promise.object(
    computed('file', 'symbolicLinkTargetProxy', async function sizeProxy() {
      let size;
      if (this.file?.type !== FileType.SymbolicLink) {
        size = this.file?.size;
      } else {
        const target = await this.symbolicLinkTargetProxy;
        size = target?.size;
      }

      return typeof size === 'number' ? bytesToString(size) : null;
    })
  ),
});
