/**
 * Setting default settings for spin-buttons components 
 *
 * @module components/spin-button
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// NOTE: as of 27.03.2017 it requires usage of custom fork:
// https://github.com/kliput/ember-spin-button/tree/onedata
import SpinButton from 'ember-spin-button/components/spin-button';

export default SpinButton.extend({
  /**
   * The "timout" is a typo provided by original addon...
   */
  defaultTimout: false,
  
  startDelay: 0,
  buttonStyle: 'expand-left',
});
