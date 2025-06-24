/**
 * Custom extension of ember-bootstrap `<BsCollapse>`
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import Component from '@glimmer/component';

const isTest = config.environment === 'test';

export default class OneCollapse extends Component {
  get transitionDuration() {
    return isTest ? 0 : this.args.transitionDuration;
  }
}
