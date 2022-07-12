// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * A form element abstraction, which is a base for the form field and the form group.
 * The form component mechanism is built using Composite design pattern where
 * FormElement is Component, FormFieldsGroup is Composite and FormField is Leaf.
 * Forms framework classes inheritance is shown below:
 *
 *                            +-------------+
 *                            | FormElement |
 *                            +-----+-------+
 *                                  ^
 *                                  |
 *      +---------------------------+--------------------------+
 *      |                                                      |
 * +----+------+                                      +--------+--------+
 * | FormField |                                      | FormFieldsGroup |
 * +-----------+                                      +-----------------+
 *   ^                                                         ^
 *   | +---------------+                                       |
 *   +-+ DatetimeField |                       +---------------+-------------+
 *   | +---------------+                       |                             |
 *   |                             +---------------------+     +-------------+-------------+
 *   | +-----------+               | FormFieldsRootGroup |     | FormFieldsCollectionGroup |
 *   +-+ JsonField |               +---------------------+     +---------------------------+
 *   | +-----------+
 *   |
 *   | +---------------+
 *   +-+ DatetimeField |
 *   | +---------------+
 *   |
 *   | +---------------+
 *   +-+ LoadingFieldd |
 *   | +---------------+
 *   |
 *   | +-----------------+
 *   +-+ PrivilegesField |
 *   | +-----------------+
 *   |
 *   | +-----------------+
 *   +-+ StaticTextField |
 *   | +-----------------+
 *   |
 *   | +-----------+
 *   +-+ TagsField |
 *   | +-----------+
 *   |
 *   | +-------------+
 *   +-+ ToggleField |
 *   | +-------------+
 *   |
 *   | +-----------+
 *   +-+ TextField |
 *   | +-+---------+
 *   |   |
 *   |   | +-------------+
 *   |   +-+ NumberField |
 *   |     +-------------+
 *   |
 *   | +--------------+
 *   +-+ OptionsField |
 *     +-+------------+
 *       |
 *       | +---------------+
 *       +-+ DropdownField |
 *       | +---------------+
 *       |
 *       | +------------+
 *       +-+ RadioField |
 *         +------------+
 *
 * Each new form should start with creating FormFieldsRootGroup instance, which
 * contains all form elements. Then it can contain fields and field-groups depending
 * on requirements. Basically fields should be grouped into a field-group when
 * they have some behaviour or state in common (like they should be hidden in the
 * same time and grouping them allows to animate hiding).
 *
 * The simpliest example of form declaration with one text input:
 * ```
 * const component = this;
 * const form = FormFieldsRootGroup.extend({
 *   ownerSource: reads('component'), // Form needs to have an owner
 *   onValueChange() {
 *     this._super(...arguments);
 *     component.notifyAboutChange();
 *   },
 * }).create({
 *   component,
 *   i18nPrefix: tag`${'component.i18nPrefix'}.fields`,
 *   fields: [
 *     TextField.create({ name: 'firstName' }),
 *   ],
 * });
 * ```
 * You can then interact with form instance. Some examples:
 * `form.dumpValues()` returns { firstName: 'Some user input' }
 * `set(form, 'isEnabled', false)` will block all fields in the form
 * `set(form.getFieldByPath('name'), 'isEnabled', false)` will block only one field
 * `form.reset()` to reset form to default values
 *
 * Notice: extending form elements in place is a very common practice. You can
 * do separate configuration in extend and create or do everything in extend and
 * then only create() without no extra config - it's up to you.
 *
 * It is very common to build form fields, which depend on each other. Example:
 * ```
 * const component = this;
 * const form = FormFieldsRootGroup.extend({
 *   component,
 *   ownerSource: reads('component'), // Form needs to have an owner
 *   i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
 *   onValueChange() {
 *     this._super(...arguments);
 *     component.notifyAboutChange();
 *   },
 * }).create({
 *   fields: [
 *     ToggleField.create({ name: 'showMore', defaultValue: false }),
 *     FormFieldsGroup.extend({
 *       isExpanded: reads('parent.value.showMore'),
 *     }.create({
 *       name: 'toggleableFormGroup',
 *       fields: [
 *         NumberField.create({
 *           name: 'upperLimit',
 *           defaultValue: '30',
 *         }),
 *         NumberField.create({
 *           name: 'boundedNumber',
 *           gte: 10,
 *           lt: parseFloat('parent.value.upperLimit'),
 *         }),
 *       ],
 *     }))
 *   ],
 * });
 * ```
 * Tip: you can access some specific field value in form using absolute path.
 * In aftermentioned example line:
 * `parseFloat('parent.value.upperLimit')`,
 * is the same as line:
 * `parseFloat('valuesSource.toggleableFormGroup.upperLimit')`.
 * In the latter you traverse through values tree, not fields tree, so you don't
 * need to use field `.value` to access the field value. To sum it up:
 * * valuesSource is a tree of values for the whole form,
 * * value is a tree of values for the current field/group
 * * parent.value is a tree of values for the parent group.
 * All these field properties are available in every form element (except root
 * group, which has no parent).
 *
 * # Values tree
 *
 * All form values are persisted in so-called values tree. Values tree is a
 * ValuesContainer object with keys equal to field/group name and value equal to
 * field value / group subtree value. In earlier example with depending fields
 * we have a tree:
 * ```
 * {
 *   showMore: Boolean,
 *   toggleableFormGroup: {
 *     upperLimit: number,
 *     boundedNumber: number,
 *   },
 * }
 * ```
 * This tree can be access via dumpValue() on the root group or via valuesSource property
 * inside any form element. This tree is a single source of truth for form element
 * values hence it must not be modified directly. Only root group and parent component
 * is allowed to modify values (one-way approach). Despite this restriction each
 * form element can trigger an event of change via method `valueChanged(value)`
 * which will be passed right to the root group and treated as an user input.
 * After changing a value, form field updates its value stored in `value` property
 * which is basically `reads('valuesSource.' + fieldPath)`. Notice that `value`
 * property of the group will be a ValuesContainer with values of nested fields.
 *
 * # Translations
 *
 * Each form element tries to find corresponding translations, that it can use
 * for itself. The most generic example is label translation. It tries to load
 * translation from `i18nPrefix + '.' + fieldPath + '.label` and if it exists then
 * it is used as a label. If not, then label is empty. The same situation is with
 * placeholders for inputs, labels for options in radio fields etc. `i18nPrefix`
 * is taken from root group and is the same for all form element (until overridden).
 * Also the label/placeholder/sth-else "guessing" algorithm can be customized - you
 * need only to override label/placeholder/sth-else computed property of a field.
 *
 * # Advanced extending
 *
 * Form element can be extended like any other EmberObject. More than that, it can
 * have injected serivces (because all form elements has an owner the same as root
 * group). So you are allowed to:
 * * use computed props,
 * * use observers,
 * * depend on parent component properties and methods (see first example),
 * * add new methods and override existing ones,
 * * do some extra preparations in init(),
 * * depend on any field value (via valuesSource or parent.value,
 *   parent.parent.value.... and so on)
 * * double use the same field (!) - two references to the same field in `fields`
 *   array will cause double render of that field with the same shared state
 *   of validation, visibility and value
 *
 * # When you want a list of the same fields, but each with a different value
 *
 * A common case is to create a field, that allows to dynamically add new fields
 * (like in a list), and each of these fields is basically a clone of the previous one.
 * All these fields have the same label, placeholder, validation rules etc. Only
 * value differs. To create such mechanism it is supposed to add new fields
 * dynamically to the fields array, each with different name which means that
 * translation have to be customized to allow reusing despite of different names
 * etc. well... very complicated. There is a better solution:
 * FormFieldsCollectionGroup. It is a special fields group that allows dynamic
 * adding and removing fields created using factory method. It goes like this:
 * At the very beginning collection group has no fields. When you call
 * `addNewField()` collection group calls method
 * `fieldFactoryMethod(uniqueValueName)`. You have to implement (override)
 * this method so it returns a form element instance, that will be later added
 * to the fields array by `addNewField` method. After that collection group will
 * notify about change with new field and its default value.
 * Field created in `fieldFactoryMethod` can have (and usually will) the same name.
 * In that case it MUST have unique `valueName` - you can make it unique using
 * passed `uniqueValueName` value. What is valueName? It is used to build path
 * to the field value in values tree. So it looks like: `parentPath + '.' + valueName`.
 * In 99% of cases valueName IS name (under the hood `valueName: reads('name')`).
 * But you can override valueName like in collection group factory method and
 * separate values tree paths from fields names. This appropach allows to
 * share the same translations (due to the same name which is used to create a path
 * in translations), but different values (due to the different valueName which
 * is used to create a path in values tree).
 *
 * @module utils/form-component/form-element
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  conditional,
  and,
  equal,
  raw,
  getBy,
  notEmpty,
  writable,
  or,
} from 'ember-awesome-macros';
import { A } from '@ember/array';
import cloneValue from 'onedata-gui-common/utils/form-component/clone-value';

/**
 * @typedef {'md'|'sm'} FormElementSize
 */

/**
 * @typedef {'view'|'edit'} FormElementMode
 */

export default EmberObject.extend(OwnerInjector, I18n, {
  i18n: service(),

  /**
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * @virtual
   * @type {Array<Utils.FormComponent.FormElement>}
   */
  fields: computed(() => A()),

  /**
   * Component used to render this form element. Each concrete form element
   * extension has specified `fieldComponentName`, but you can override it to
   * customize rendering on your own.
   * @virtual
   * @type {String}
   */
  fieldComponentName: undefined,

  /**
   * @virtual
   * @type {any}
   */
  defaultValue: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isEnabled: true,

  /**
   * Hiding/showing without animation
   * @virtual
   * @type {boolean}
   */
  isVisible: true,

  /**
   * CSS classes for field component
   * @virtual
   * @type {String}
   */
  classes: '',

  /**
   * Should validation "ok" and "x" icon be rendered for this field to indicate
   * validation status.
   * @virtual
   * @type {boolean}
   */
  withValidationIcon: true,

  /**
   * If false, then bootstrap classes ("has-success", "has-error") will not be
   * added to the field component. Along with withValidationIcon it can be used
   * to hide validation status notification.
   * @virtual
   * @type {boolean}
   */
  areValidationClassesEnabled: true,

  /**
   * If true, then a colon ':' will be automatically added to the end of a label.
   * @virtual
   * @type {boolean}
   */
  addColonToLabel: true,

  /**
   * Classname internally used by `one-label-tip` to style tooltip.
   * @virtual optional
   * @type {String}
   */
  tooltipClass: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  afterComponentName: undefined,

  /**
   * Can be modified only via `changeMode()`
   * @type {FormElementMode}
   */
  mode: 'edit',

  /**
   * Can be modified only via `markAs(Not)Modified()`
   * @type {boolean}
   */
  isModified: false,

  /**
   * @type {Utils.FormComponent.FormElement}
   */
  parent: undefined,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * List of nested fields with validation errors
   * @type {Array<Utils.FormComponent.FormField>}
   */
  invalidFields: Object.freeze([]),

  /**
   * @type {boolean}
   */
  isGroup: false,

  /**
   * Currently supported values: 'md', 'sm'.
   * NOTE: Due to the styling strategy, all nested fields of the element, which has size
   * 'sm', will be mostly rendered as small regardless their own size value.
   * @virtual optional
   * @type {ComputedProperty<FormElementSize>}
   */
  size: writable(or('parent.sizeForChildren', raw('md'))),

  /**
   * @virtual optional
   * @type {ComputedProperty<FormElementSize>}
   */
  sizeForChildren: reads('size'),

  /**
   * CSS classes for field component, which are calculated internally by field
   * itself (to not override custom CSS classes passed via `classes`).
   * @type {String}
   */
  internalClasses: '',

  /**
   * @virtual optional
   * @type {ComputedProperty<String>}
   */
  translationName: reads('name'),

  /**
   * @virtual optional
   * @type {ComputedProperty<String>}
   */
  translationPath: computed(
    'parent.translationPath',
    'translationName',
    function translationPath() {
      return this.buildPath(
        this.get('parent.translationPath'),
        this.get('translationName')
      );
    }
  ),

  /**
   * @virtual optional
   * @type {ComputedProperty<String>}
   */
  valueName: reads('name'),

  /**
   * This value is checked in component hbs to determine if field should be disabled.
   * "Effectively enabled" means "this field is enabled and all parents of ths field
   * are enabled".
   * @type {ComputedProperty<boolean>}
   */
  isEffectivelyEnabled: conditional(
    'parent',
    and('parent.isEffectivelyEnabled', 'isEnabled'),
    'isEnabled',
  ),

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
   * @type {ComputedProperty<String>}
   */
  valuePath: computed('parent.valuePath', 'valueName', function valuePath() {
    return this.buildPath(
      this.get('parent.valuePath'),
      this.get('valueName')
    );
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ValuesContainer>}
   */
  valuesSource: reads('parent.valuesSource'),

  /**
   * @type {ComputedProperty<any>}
   */
  value: writable(conditional(
    notEmpty('valuePath'),
    getBy('valuesSource', 'valuePath'),
    'valuesSource'
  )),

  /**
   * @override
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
  label: computed('i18nPrefix', 'translationPath', function label() {
    return this.getTranslation('label', {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  tip: computed('i18nPrefix', 'translationPath', function tip() {
    return this.getTranslation('tip', {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInEditMode: equal('mode', raw('edit')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInViewMode: equal('mode', raw('view')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInMixedMode: equal('mode', raw('mixed')),

  fieldsParentSetter: observer('fields.@each.parent', function fieldsParentSetter() {
    const fields = this.get('fields');
    if (fields) {
      const fieldsToInjectParent = fields.rejectBy('parent', this);
      fieldsToInjectParent.setEach('parent', this);
      // In more complicated forms with multiple levels of groups
      // owner is not injected properly, because observers are not
      // firing. We need to kick this mechanism manually
      fieldsToInjectParent.invoke('updateOwner');
    }
  }),

  valuesSourceObserver: observer('valuesSource', function valuesSourceObserver() {
    this.notifyPropertyChange('valuePath');
    this.notifyPropertyChange('value');
    this.get('fields').invoke('valuesSourceObserver');
  }),

  init() {
    this._super(...arguments);

    this.fieldsParentSetter();
  },

  willDestroy() {
    this._super(...arguments);
    this.get('fields').invoke('destroy');
  },

  /**
   * @public
   * @param {FormElementMode} mode
   * @returns {undefined}
   */
  changeMode(mode) {
    this.set('mode', mode);
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
   * Use this method to notify about changed value
   * @public
   */
  valueChanged(value) {
    this.onValueChange(value, this);
  },

  /**
   * Use this method to notify about lost focus
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
    return cloneValue(this.get('defaultValue'));
  },

  /**
   * @virtual
   * @public
   */
  dumpValue() {
    return cloneValue(this.get('value'));
  },

  /**
   * @public
   */
  useCurrentValueAsDefault() {
    this.set('defaultValue', this.dumpValue());
  },

  /**
   * @public
   */
  reset() {
    this.valueChanged(this.dumpDefaultValue());
    this.markAsNotModified();
  },

  /**
   * @public
   * At this level of abstraction we don't know how to return nested fields.
   * Concrete implementation is in FormFieldsGroup
   */
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

  updateOwner() {
    this.ownerSourceObserver();
    this.get('fields').invoke('updateOwner');
  },

  buildPath(parentPath, name) {
    if (name) {
      return parentPath ? `${parentPath}.${name}` : name;
    }
  },

  getTranslation(translationName, placeholders = {}, options = {}) {
    let completeTranslationPath = this.get('translationPath');
    if (completeTranslationPath) {
      completeTranslationPath += '.';
    }
    completeTranslationPath += translationName;
    return this.t(completeTranslationPath, placeholders, options);
  },
});
