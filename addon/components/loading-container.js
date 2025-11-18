/**
 * Wraps other template into loader or error alert basing on provided state
 *
 * It helps in building GUI with showing state of some async resource.
 *
 * An example:
 * ```
 * <LoadingContainer @isLoading={{loadingState}} @errorReason={{backendError}}>
 *   <SomeComponent />
 * </LoadingContainer>
 * ```
 *
 * It will render loader (eg. spinner) if `loadingState` is true.
 * It will render error message if `backendError` is non-empty string
 * It will render `some-component` if above conditions are not met.
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
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
   * @virtual optional
   * @type {string}
   */
  loadingLabel: '',

  /**
   * If true, spinner will be absolutely centered, otherwise it will fill
   * the parent block to centerize itself
   * @virtual optional
   * @type {boolean}
   */
  absoluteCentered: true,

  /**
   * @virtual optional
   * @type {'xxs'|'xs'|'sm'|'md'|'lg'}
   */
  sizeClass: 'md',

  /**
   * Classname added to internally rendered `<SpinSpinnerBlock>`.
   * @type {string}
   */
  spinnerBlockClass: undefined,

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
