import EmberObject, { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default EmberObject.extend(OwnerInjector, I18n, {
  i18n: service(),

  /**
   * @type {Array<Utils.FormComponent.FormElement>}
   */
  fields: computed(() => []),

  /**
   * @type {boolean}
   */
  isEnabled: true,

  /**
   * @type {boolean}
   */
  isVisible: true,

  /**
   * @type {string}
   */
  mode: 'edit',

  /**
   * @type {boolean}
   */
  isModified: false,

  /**
   * @type {Utils.FormComponent.FormElement}
   */
  parent: undefined,

  /**
   * @type {string}
   */
  name: undefined,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {Array<Utils.FormComponent.FormField>}
   */
  invalidFields: Object.freeze([]),

  /**
   * @type {any}
   */
  defaultValue: undefined,

  /**
   * Component used to render this form element
   * @type {String}
   * @virtual
   */
  fieldComponentName: undefined,

  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  withValidationIcon: true,

  /**
   * @public
   * @type {String}
   */
  classes: '',

  /**
   * @public
   * @type {boolean}
   */
  areValidationClassesEnabled: true,

  /**
   * @type {boolean}
   */
  isGroup: false,

  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  addColonToLabel: true,

  /**
   * @type {ComputedProperty<String>}
   */
  path: computed('parent.path', 'name', function path() {
    return this.buildPath(
      this.get('parent.path'),
      this.get('name')
    );
  }),

  /**
   * @public
   * @type {ComputedProperty<String>}
   */
  valueName: reads('name'),

  /**
   * @type {ComputedProperty<String>}
   */
  valuePath: computed('parent.valuePath', 'valueName', function valuePath() {
    return this.buildPath(
      this.get('parent.valuePath'),
      this.get('valueName')
    );
  }),

  /**
   * @type {EmberObject}
   */
  valuesSource: reads('parent.valuesSource'),

  /**
   * Set by valuePropertySetter
   * @type {ComputedProperty<any>}
   */
  value: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  i18nPrefix: reads('parent.i18nPrefix'),

  /**
   * @type {ComputedProperty<any>}
   */
  ownerSource: reads('parent.ownerSource'),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  label: computed('i18nPrefix', 'path', function label() {
    return this.tWithDefault(`${this.get('path')}.label`, {}, undefined);
  }),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  tip: computed('i18nPrefix', 'path', function tip() {
    return this.tWithDefault(`${this.get('path')}.tip`, {}, undefined);
  }),

  valuePropertySetter: observer(
    'valuePath',
    function valuePropertySetter() {
      const valuePath = this.get('valuePath');
      this.set(
        'value',
        valuePath ? reads(`valuesSource.${valuePath}`) : reads('valuesSource')
      );
    }
  ),

  fieldsParentSetter: observer('fields.@each.parent', function fieldsParentSetter() {
    const fields = this.get('fields');

    if (fields) {
      fields
        .rejectBy('parent', this)
        .setEach('parent', this);
    }
  }),

  init() {
    this._super(...arguments);

    this.fieldsParentSetter();
    this.valuePropertySetter();
  },

  /**
   * @public
   * @param {string} mode one of: 'edit', 'show'
   * @returns {undefined}
   */
  changeMode(mode) {
    this.set('mode', mode);
  },

  /**
   * @public
   */
  enable() {
    this.set('isEnabled', true);
  },

  /**
   * @public
   */
  disable() {
    this.set('isEnabled', false);
  },

  /**
   * @public
   */
  markAsModified() {
    this.set('isModified', true);
  },

  /**
   * @public
   */
  markAsNotModified() {
    this.set('isModified', false);
  },

  /**
   * @public
   */
  valueChanged(value) {
    this.onValueChange(value, this);
  },

  /**
   * @public
   */
  focusLost() {
    this.onFocusLost(this);
  },

  /**
   * @virtual
   * @public
   */
  dumpDefaultValue() {
    return this.get('defaultValue');
  },

  /**
   * @virtual
   * @public
   */
  dumpValue() {
    return this.get('value');
  },

  /**
   * @public
   */
  reset() {
    this.valueChanged(this.dumpDefaultValue());
    this.markAsNotModified();
  },

  getFieldByPath() {
    return null;
  },

  /**
   * @public
   */
  onValueChange(value, field) {
    const parent = this.get('parent');

    if (parent) {
      parent.onValueChange(value, field);
    }
  },

  /**
   * @public
   */
  onFocusLost(field) {
    const parent = this.get('parent');

    if (parent) {
      parent.onFocusLost(field);
    }
  },

  buildPath(parentPath, name) {
    if (name) {
      return parentPath ? `${parentPath}.${name}` : name;
    }
  },
});
