/**
 * A static text form field.
 *
 * @module utils/form-component/clipboard-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { and, or, raw, equal } from 'ember-awesome-macros';

export default StaticTextField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/clipboard-field',

  /**
   * One of: input, textarea
   * @virtual optional
   * @type {String}
   */
  type: 'input',

  /**
   * @virtual optional
   * @type {number}
   */
  textareaRows: 5,

  /**
   * @virtual optional
   * @type {null|'monospace'}
   * Type of styling - it will apply proper classes to internal components.
   */
  fieldStyle: null,

  /**
   * @virtual optional
   * @type {String}
   * Class for `clipboard-line` components.
   */
  clipboardLineClass: or(
    and(equal('fieldStyle', raw('monospace')), raw('monospace-font')),
    raw(''),
  ),
});
