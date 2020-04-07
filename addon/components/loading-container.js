/**
 * Wraps other template into loader or error alert basing on provided state
 *
 * It helps in building GUI with showing state of some async resource.
 *
 * An example:
 * ```
 * {{#loading-container isLoading=loadingState errorReason=backendError}}
 *   {{some-component}}
 * {{/loading-container}}
 * ```
 *
 * It will render loader (eg. spinner) if `loadingState` is true.
 * It will render error message if `backendError` is non-empty string
 * It will render `some-component` if above conditions are not met.
 *
 * @module components/loading-container
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

import layout from '../templates/components/loading-container';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @virtual optional
   * If provided and tag name is not empty, set the class of additional spinner
   * container when loading.
   * @type {string}
   */
  loadingClass: '',

  /**
   * @virtual optional
   * Special flag to always render content despite of loading state.
   * It can be used when want to manually set hidden class on content element.
   */
  alwaysRender: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  centered: true,

  /**
   * @virtual optional
   * If true, show customErrorText or inlined errorReason as plain text instead of
   * error component
   * @type {Boolean}
   */
  inlineError: false,

  /**
   * If true, spinner will be absolutely centered, otherwise it will fill
   * the parent block to centerize itself
   * @type {boolean}
   */
  absoluteCentered: true,

  sizeClass: 'md',

  isLoaded: computed('isLoading', 'isError', function () {
    return !this.get('isLoading') && !this.get('isError');
  }),
  isLoading: undefined,
  isError: computed('errorReason', function () {
    return this.get('errorReason') != null;
  }),
  errorReason: undefined,
  customErrorMessage: undefined,

  _spinnerBlockClass: computed(
    'centered',
    'absoluteCentered',
    function _spinnerBlockClass() {
      const {
        centered,
        absoluteCentered,
      } = this.getProperties(
        'centered',
        'absoluteCentered',
      );
      if (centered) {
        return absoluteCentered ? 'absolute-middle-centered' : 'fill-middle-centered';
      } else {
        return '';
      }
    }
  ),
});
