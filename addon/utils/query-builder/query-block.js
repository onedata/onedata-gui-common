/**
 * A base class for query builder blocks.
 * 
 * @module utils/query-builder/query-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default EmberObject.extend(Evented, {
  /**
   * The name of a component, which should be used to render this block. The rendered
   * component will be `query-builder/${this.renderer}`.
   * @virtual
   * @type {String}
   */
  renderer: null,

  /**
   * Should be invoked when the block changes it's content, eg. when generated text
   * will change. Should pass this when invoked.
   * @virtual
   * @type {(QueryBlock: Object) => undefined}
   */
  notifyUpdate: notImplementedIgnore,

  /**
   * How many levels have tree starting from this query block.
   * Eg. 
   * @type {Number|ComputedProperty<Number>}
   */
  levelScore: 1,
});
