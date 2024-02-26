/**
 * Extension of ember-bootstrap modal body, that specifies custom layout.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Body from 'ember-bootstrap/components/bs-modal/body';
import layout from 'onedata-gui-common/templates/components/one-modal/body';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OneModalBody extends Body {
  layout = layout;

  @service scrollState;

  @action
  scrollOccurred(event) {
    this.scrollState.scrollOccurred(event);
  }
}
