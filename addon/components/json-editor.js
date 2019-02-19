import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/json-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['json-editor'],
  classNameBindings: ['bootstrapClasses'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.jsonEditor',

  /**
   * @type {string}
   */
  value: '',

  /**
   * Set by `onChange` action
   * @type {boolean}
   */
  isValid: undefined,

  /**
   * @type {boolean}
   */
  useBootstrapClasses: true,

  /**
   * @type {boolean}
   */
  isErrorMsgVisible: true,

  /**
   * @type {Function}
   * @param {Object} change
   * @param {string} change.value
   * @param {Object|undefined} change.parsedValue
   * @param {boolean} change.isValid
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  bootstrapClasses: computed(
    'useBootstrapClasses',
    'isValid',
    function bootstrapClasses() {
      const {
        useBootstrapClasses,
        isValid,
      } = this.getProperties('useBootstrapClasses', 'isValid');
      if (useBootstrapClasses) {
        let classes = 'form-group';
        if (isValid === true) {
          classes += ' has-success';
        } else if (isValid === false) {
          classes += ' has-error';
        }
        return classes;
      } else {
        return '';
      }
    }
  ),

  actions: {
    onChange(value) {
      const onChange = this.get('onChange');
      let isValid = true;
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        isValid = false;
      }
      this.setProperties({
        value,
        isValid,
      });
      onChange({
        value,
        parsedValue,
        isValid,
      });
    }
  }
});
