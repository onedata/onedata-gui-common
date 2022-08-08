import Component from '@ember/component';
import { computed } from '@ember/object';
import { promise } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/file/visual-presenter';
import { FileType } from 'onedata-gui-common/utils/file';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'file-visual-presenter'],

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
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<AtmFile|null>>}
   */
  symbolicLinkTargetProxy: promise.object(
    computed('value', 'context', async function fileProxy() {
      if (
        !this.context?.getSymbolicLinkTargetById ||
        this.value?.type !== FileType.SymbolicLink ||
        !this.value?.file_id
      ) {
        return null;
      }

      return this.context.getSymbolicLinkTargetById(this.value.file_id);
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  pathProxy: promise.object(
    computed('value', 'context', async function pathProxy() {
      if (!this.value?.file_id) {
        return null;
      }

      return this.context?.getFilePathById?.(this.value.file_id) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: promise.object(
    computed('value', 'context', async function pathProxy() {
      if (!this.value?.file_id) {
        return null;
      }

      return this.context?.getFileUrlById?.(this.value.file_id) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<size|null>>}
   */
  sizeProxy: promise.object(
    computed('value', 'symbolicLinkTargetProxy', async function sizeProxy() {
      let size;
      if (this.value?.type !== FileType.SymbolicLink) {
        size = this.value?.size;
      } else {
        const target = (await this.symbolicLinkTargetProxy);
        size = target?.size;
      }

      return typeof size === 'number' ? bytesToString(size) : null;
    })
  ),
});
