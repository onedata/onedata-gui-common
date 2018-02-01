/**
 * A component for predefined, usually nearly full-screen messages - content fillers.
 * Uses one-image to show a placeholder image.
 * Typical usage: 
 * ```
 * {{content-info
 *   class="scroll-breakpoint-700"
 *   header="Some main header"
 *   imagePath="assets/images/image.svg"
 *   imageText="Image title"
 *   imageTextClass="center-image-text"
 *   text="Some description"
 *   buttonLabel="Enter"
 *   buttonAction=(action "mainButtonClicked")
 * }}
 * ```
 * 
 * @module components/content-info
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/content-info';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { computed, trySet } from '@ember/object';

const defaultButtonAction = notImplementedReject;

export default Component.extend({
  layout,
  classNames: ['content-info'],

  /**
   * Header text
   * @type {string}
   */
  header: '',

  /**
   * Second header text
   * @type {string}
   */
  subheader: '',

  /**
   * Text used as a description
   * @type {string}
   */
  text: '',

  /**
   * Path to an image file (placed between the description and the primary button)
   * @type {string}
   */
  imagePath: null,

  /**
   * Text placed on the image
   * @type {string}
   */
  imageText: '',

  /**
   * CSS class for text placed on the image
   * @type {string}
   */
  imageTextClass: '',

  /**
   * Text inside primary button
   * @type {string}
   */
  buttonLabel: '',

  /**
   * CSS class for primary button
   * @type {string}
   */
  buttonClass: '',

  /**
   * A function on click primary button.
   * The function should return Promise which indicated status of action.
   * @type {Function}
   */
  buttonAction: defaultButtonAction,

  /**
   * If true, the action button is disabled
   * @type {boolean}
   */
  buttonDisabled: false,

  _actionInProgress: false,

  _showButton: computed(function _getShowButton() {
    return this.get('buttonAction') !== defaultButtonAction;
  }),

  _buttonAction() {
    this.set('_actionInProgress', true);
    try {
      const actionResult = this.get('buttonAction')();
      if (actionResult.finally) {
        return actionResult.finally(() =>
          trySet(this, '_actionInProgress', false)
        );
      } else {
        this.set('_actionInProgress');
        return actionResult;
      }
    } catch (error) {
      trySet(this, '_actionInProgress', false);
      throw error;
    }
  },
});
