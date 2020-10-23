/**
 * A base class for query builder blocks.
 * 
 * @module utils/query-builder/query-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

const QueryBlock = EmberObject.extend({
  /**
   * The name of a component, which should be used to render this block. The rendered
   * component will be `query-builder/${this.renderer}`.
   * @type {String}
   */
  renderer: null,
});

export default QueryBlock;
