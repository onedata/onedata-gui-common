/**
 * Field for rendering `<ul>` list, where `<li>` elements are either plain text or renders
 * some component.
 *
 * The `value` property of this class is an array with values of type:
 * - string,
 * - instance of `ListFieldComponent` with `componentPath` set to component path.
 *
 * If the item is a component definition, it has a `field` property injected.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default class StaticListField extends FormField {
  /**
   * @override
   */
  fieldComponentName = 'form-component/static-list-field';

  /**
   * @override
   */
  isValid = true;
}

export class ListFieldComponent {
  /**
   * @param {string} componentPath Path to component that will be rendered. The component
   *   will have a `field` property injected with instance of `StaticListField`.
   * @param {any} [componentOptions] Options injected into component instance as
   *   `options` property. The format of options is defined by the component - for example
   *   it could be an Object.
   */
  constructor(componentPath, componentOptions = {}) {
    /** @type {string} */
    this.componentPath = componentPath;
    /** @type {any} */
    this.componentOptions = componentOptions;
  }
}
