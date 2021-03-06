/**
 * A textarea form field.
 *
 * @module utils/form-component/textarea-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
import { conditional, raw, and } from 'ember-awesome-macros';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/textarea-field',

  /**
   * @virtual optional
   * @type {Boolean}
   */
  showsStaticTextInViewMode: false,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    return this.t(`${this.get('path')}.placeholder`, {}, { defaultValue: '' });
  }),

  /**
   * @override
   */
  internalClasses: conditional(
    and('showsStaticTextInViewMode', 'isInViewMode'),
    raw('view-as-static-text'),
    raw('')
  ),
});
