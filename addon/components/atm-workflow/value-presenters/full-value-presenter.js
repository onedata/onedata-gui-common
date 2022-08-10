import Component from '@ember/component';
import { computed } from '@ember/object';
import { bool, conditional, eq, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/full-value-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  getRawValuePresenter,
  getVisualValuePresenter,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';

export default Component.extend(I18n, {
  classNames: ['full-value-presenter'],
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.fullValuePresenter',

  /**
   * @virtual
   * @type {unknown}
   */
  value: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {'visual'|'raw'}
   */
  presenterType: undefined,

  /**
   * @type {ComputedProperty<string|null>}
   */
  visualPresenterComponent: computed(
    'dataSpec',
    function visualPresenterComponent() {
      return getVisualValuePresenter(this.dataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  rawPresenterComponent: computed(
    'dataSpec',
    function visualPresenterComponent() {
      return getRawValuePresenter(this.dataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  currentPresenterComponent: conditional(
    eq('presenterType', raw('visual')),
    'visualPresenterComponent',
    'rawPresenterComponent'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPresenterTypeToggleVisible: bool('visualPresenterComponent'),

  init() {
    this._super(...arguments);
    this.set('presenterType', this.visualPresenterComponent ? 'visual' : 'raw');
  },

  actions: {
    presenterTypeChange(type) {
      this.set('presenterType', type);
    },
  },
});
