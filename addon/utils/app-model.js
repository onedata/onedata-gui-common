/**
 * This is a legacy class that was intended to use as a model for
 * `route:application`. Not it's deprecated.
 *
 * @deprecated
 * @module utils/app-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * Collection of objects representing main menu items
   * To configure main menu items, add `onedataTabs` key to App config like this:
   * ```
   * onedataTabs: [
   *   { id: 'clusters', icon: 'menu-clusters' },
   * ]
   * ```
   * Each object has also optional `disabled` property for showing main menu
   * items as disabled.
   * @virtual
   * @type {Ember.Array}
   */
  mainMenuItems: undefined,
});
