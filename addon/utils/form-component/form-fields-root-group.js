/**
 * A container for all form elements - root group. To work properly it should have
 * specified 'ownerSource' and 'i18nPrefix'.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { set, get } from '@ember/object';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

export default FormFieldsGroup.extend({
  /**
   * @virtual
   * @override
   */
  i18nPrefix: undefined,

  /**
   * @virtual
   * @override
   */
  ownerSource: undefined,

  /**
   * @override
   */
  path: '',

  /**
   * @override
   */
  translationName: '',

  /**
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  valueName: '',

  /**
   * @override
   */
  valuePath: '',

  /**
   * @override
   */
  valuesSource: undefined,

  init() {
    if (!this.fields) {
      this.set('fields', A());
    }
    if (!this.get('valuesSource')) {
      this.reset();
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  onValueChange(value, field) {
    if (field === this) {
      this.set('valuesSource', value);
    } else {
      const valuePath = `valuesSource.${get(field, 'valuePath')}`;

      // Construct EmberObjects across `path` if not exist
      let targetValuesObject = this;
      valuePath.split('.').slice(0, -1).forEach(pathElement => {
        let nextTargetValuesObject = get(targetValuesObject, pathElement);
        if (!nextTargetValuesObject) {
          nextTargetValuesObject = createValuesContainer();
          set(targetValuesObject, pathElement, nextTargetValuesObject);
        }
        targetValuesObject = nextTargetValuesObject;
      });

      this.set(valuePath, value);
    }

    if (!get(field, 'isGroup')) {
      field.markAsModified();
    }
  },

  /**
   * @override
   */
  onFocusLost(field) {
    field.markAsModified();
  },
});
