/**
 * A component responsible for rendering field with list of plain text or component items.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import template from '../../templates/components/form-component/static-list-field';
import { layout, classNames } from '@ember-decorators/component';
import { reads } from '@ember/object/computed';

@layout(template)
@classNames('static-list-field')
export default class StaticListField extends FieldComponentBase {
  /**
   * @type {ComputedProperty<Array<string|ListFieldComponent>>}
   */
  @reads('field.value') items;
}
