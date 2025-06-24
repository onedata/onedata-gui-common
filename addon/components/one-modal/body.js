/**
 * Extension of ember-bootstrap modal body, that specifies custom layout.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OneModalBody extends Component {
  @service scrollState;

  @action
  scrollOccurred(event) {
    this.scrollState.scrollOccurred(event);
  }
}
