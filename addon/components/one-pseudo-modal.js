/**
 * A modal-like component that allows to test components inside modal but without
 * modal logic and styles, which speeds-up tests execution.
 *
 * Implemented mainly for testing, and will facilitate transition from modals to other
 * containers in future.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-pseudo-modal';

export default Component.extend({
  layout,
  classNames: ['one-pseudo-modal'],
});
