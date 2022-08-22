/**
 * A "table body row" object value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableBodyRowPresenterBase from '../commons/table-body-row-presenter-base';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/object/table-body-row-presenter';

export default TableBodyRowPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'object',

  /**
   * @type {ComputedProperty<(propertyName: string) => string>}
   */
  stringifyObjectProperty: computed('value', function stringifyObjectProperty() {
    const isValidObject = typeof this.value === 'object' &&
      this.value !== null &&
      !Array.isArray(this.value);
    return (propertyName) => {
      if (!isValidObject || this.value[propertyName] === undefined) {
        return '–';
      }

      return JSON.stringify(this.value[propertyName]);
    };
  }),
});
