/**
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import _ from 'lodash';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['pages-control-demo-component'],

  /**
   * @type {Array}
   */
  array: undefined,

  pageSize: 10,

  /**
   * @type {Utils.ArrayPaginator}
   */
  paginator: undefined,

  init() {
    this._super(...arguments);
    this.set('array', _.range(0, 128));
    this.set('paginator', ArrayPaginator.extend({
      array: reads('demoComponent.array'),
      pageSize: reads('demoComponent.pageSize'),
    }).create({
      demoComponent: this,
    }));
  },
});
