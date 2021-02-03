/**
 * A generic component for showing resources list. For now it only shows names, without more
 * contextual content. To improve in more complicated use cases.
 *
 * @module components/resources-list
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { array } from 'ember-awesome-macros';
import layout from '../templates/components/resources-list';

export default Component.extend({
  layout,
  classNames: ['resources-list'],

  /**
   * @virtual
   * @type {Array<ResourceListItem>}
   */
  items: computed(() => []),

  /**
   * @type {ComputedProperty<Array<ResourceListItem>>}
   */
  sortedItems: array.sort('items', ['label']),
});

/**
 * Should be used to construct items of resources list. Array of ResourceListItem
 * instances should be passed via items property to ResourcesList component.
 */
export const ResourceListItem = EmberObject.extend({
  /**
   * Item label. Used to render item label when `conflictingLabelSource` is not defined.
   * Always used for sorting (hence must be set even when
   * `conflictingLabelSource` is defined).
   * @virtual
   * @type {String}
   */
  label: undefined,

  /**
   * If set, it takes precedence over label property in label rendering. Should be an
   * object with properties needed to show conflicting labels (a model instance
   * in most cases).
   * @virtual
   * @type {Object}
   */
  conflictingLabelSource: undefined,

  /**
   * @virtual
   * @type {String}
   */
  icon: undefined,

  /**
   * Default value is set on init.
   * @virtual optional
   * @type {Array<Utils.Action>}
   */
  actions: undefined,

  /**
   * If that property is defined, the item is link
   */
  link: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('actions')) {
      this.set('actions', []);
    }
  },
});
